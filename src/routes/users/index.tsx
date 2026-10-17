import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createColumnHelper, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import { CheckCircle2, Eye, ShieldAlert, ShieldCheck, Trash2, User, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteUser, getUsers, updateUserRole } from "@/lib/server/users";

type UserRow = {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	emailVerified: boolean;
	createdAt: string;
};

export const Route = createFileRoute("/users/")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	component: UsersPage,
});

function UsersPage() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id;

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => getUsers(),
	});

	const updateRoleFn = useServerFn(updateUserRole);
	const deleteFn = useServerFn(deleteUser);

	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [actionError, setActionError] = useState("");
	const [actionSuccess, setActionSuccess] = useState("");

	const usersList = usersQuery.data ?? [];
	const adminCount = usersList.filter((u) => u.role === "admin").length;

	const features = tableFeatures({});
	const columnHelper = createColumnHelper<typeof features, UserRow>();

	const columns = useMemo(
		() =>
			columnHelper.columns([
				columnHelper.display({
					id: "user",
					header: "Pengguna",
					cell: (info) => {
						const u = info.row.original as UserRow;
						const isSelf = u.id === currentUserId;
						return (
							<div className="flex items-center gap-3">
								<div className="flex size-9 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] font-bold text-neutral-800">
									{u.name?.charAt(0).toUpperCase() || <User className="size-4" />}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-bold text-neutral-950">{u.name || "Tanpa Nama"}</span>
										{isSelf && (
											<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-800">
												Akun Anda
											</span>
										)}
									</div>
									<p className="text-[11px] text-neutral-500">{u.email}</p>
								</div>
							</div>
						);
					},
				}),
				columnHelper.accessor("role", {
					header: "Peran (Role)",
					cell: (info) => {
						const user = info.row.original as UserRow;
						const isSelf = user.id === currentUserId;

						const handleRoleChange = async (nextRole: Role) => {
							if (nextRole === user.role) return;
							setActionError("");
							setActionSuccess("");

							if (isSelf && nextRole !== "admin") {
								setActionError(
									"Anda tidak dapat menurunkan peran (self-demotion) akun Anda sendiri.",
								);
								return;
							}

							try {
								await updateRoleFn({ data: { userId: user.id, role: nextRole } });
								setActionSuccess(`Peran pengguna ${user.email} diubah menjadi ${nextRole}.`);
								await queryClient.invalidateQueries({ queryKey: ["users"] });
							} catch (err) {
								setActionError(err instanceof Error ? err.message : "Gagal memperbarui peran");
							}
						};

						return (
							<div className="flex items-center gap-2">
								<select
									value={user.role}
									onChange={(e) => handleRoleChange(e.target.value as Role)}
									disabled={isSelf}
									title={isSelf ? "Peran akun sendiri terlindungi (anti self-demotion)" : undefined}
									className={`rounded-md border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none ${
										user.role === "admin"
											? "border-black bg-[#111111] text-white"
											: "border-[#E5E2DC] bg-white text-neutral-800"
									} ${isSelf ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-black"}`}
								>
									<option value="user" className="bg-white text-neutral-900">
										Pengguna (User)
									</option>
									<option value="admin" className="bg-white text-neutral-900">
										Administrator (Admin)
									</option>
								</select>
								{isSelf && (
									<span title="Anti Self-Demotion" className="text-neutral-700">
										<ShieldCheck className="size-4" />
									</span>
								)}
							</div>
						);
					},
				}),
				columnHelper.accessor("emailVerified", {
					header: "Verifikasi",
					cell: (info) =>
						info.getValue() ? (
							<span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
								<CheckCircle2 className="size-3.5" />
								<span>Terverifikasi</span>
							</span>
						) : (
							<span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400">
								<XCircle className="size-3.5" />
								<span>Belum</span>
							</span>
						),
				}),
				columnHelper.display({
					id: "actions",
					header: "Aksi",
					cell: (info) => {
						const u = info.row.original as UserRow;
						const isSelf = u.id === currentUserId;
						const isLastAdmin = u.role === "admin" && adminCount <= 1;

						return (
							<div className="flex items-center gap-2">
								<Link
									to="/users/$userId"
									params={{ userId: u.id }}
									className="flex size-7 items-center justify-center rounded-md border border-[#E5E2DC] bg-white text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
									title="Lihat Detail & Kelola"
								>
									<Eye className="size-3.5" />
								</Link>

								<button
									type="button"
									disabled={isSelf || isLastAdmin}
									onClick={() => {
										setDeleteId(u.id);
										setActionError("");
									}}
									title={
										isSelf
											? "Tidak dapat menghapus akun sendiri"
											: isLastAdmin
												? "Tidak dapat menghapus admin terakhir"
												: "Hapus Pengguna"
									}
									className={`flex size-7 items-center justify-center rounded-md border transition-colors ${
										isSelf || isLastAdmin
											? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 opacity-50"
											: "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
									}`}
								>
									<Trash2 className="size-3.5" />
								</button>
							</div>
						);
					},
				}),
			]),
		[columnHelper, currentUserId, adminCount, queryClient, updateRoleFn],
	);

	const table = useTable({
		features,
		columns,
		data: usersList,
	});

	const confirmDelete = async () => {
		if (!deleteId) return;
		setDeleteLoading(true);
		setActionError("");

		try {
			await deleteFn({ data: { userId: deleteId } });
			await queryClient.invalidateQueries({ queryKey: ["users"] });
			await queryClient.invalidateQueries({ queryKey: ["dashboard", "users"] });
			setActionSuccess("Pengguna berhasil dihapus.");
			setDeleteId(null);
		} catch (err) {
			setActionError(err instanceof Error ? err.message : "Gagal menghapus pengguna");
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<AdminShell
			title="Manajemen Pengguna"
			subtitle="Pengendalian hak akses dan akun terverifikasi dengan proteksi admin anti-lockout."
		>
			<div className="space-y-6">
				{/* Feedback Alerts */}
				{actionSuccess && (
					<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
						{actionSuccess}
					</div>
				)}
				{actionError && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600">
						{actionError}
					</div>
				)}

				{/* Table Container */}
				<div className="overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-xs">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id} className="border-b border-[#E5E2DC] bg-[#F9F8F6]">
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												colSpan={header.colSpan}
												className="px-5 py-3.5 text-xs font-bold tracking-wider text-neutral-600 uppercase"
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody className="divide-y divide-[#E5E2DC] text-neutral-800">
								{table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="transition-colors duration-200 hover:bg-neutral-50/90"
									>
										{row.getAllCells().map((cell) => (
											<td key={cell.id} className="px-5 py-3.5">
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								))}
								{table.getRowModel().rows.length === 0 && (
									<tr>
										<td
											colSpan={columns.length}
											className="px-5 py-12 text-center text-neutral-500"
										>
											{usersQuery.isPending
												? "Memuat data pengguna..."
												: "Belum ada akun pengguna terdaftar."}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Security Guidelines Card */}
				<div className="rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
					<div className="flex items-center gap-2 border-b border-[#E5E2DC] pb-3">
						<ShieldAlert className="size-4 text-neutral-700" />
						<h3 className="font-serif text-sm font-bold tracking-wide text-neutral-950 uppercase">
							Protokol Keamanan Akses
						</h3>
					</div>
					<ul className="mt-3 space-y-1.5 text-xs text-neutral-600">
						<li>
							&bull; <strong>Anti Self-Demotion:</strong> Anda tidak dapat menurunkan peran akun
							Anda sendiri saat sedang aktif.
						</li>
						<li>
							&bull; <strong>Anti Self-Deletion:</strong> Anda tidak dapat menghapus akun Anda
							sendiri dari panel.
						</li>
						<li>
							&bull; <strong>Last Admin Guard:</strong> Sistem mencegah penghapusan akun jika hanya
							tersisa 1 administrator di memori server.
						</li>
					</ul>
				</div>

				{/* Delete Confirmation Modal */}
				{deleteId && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/50 backdrop-blur-xs"
							onClick={() => setDeleteId(null)}
							onKeyDown={(e) => {
								if (e.key === "Escape") setDeleteId(null);
							}}
							role="presentation"
						/>
						<div className="relative w-full max-w-sm rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xl">
							<h3 className="font-serif text-lg font-bold text-neutral-950 uppercase">
								Hapus Akun Pengguna?
							</h3>
							<p className="mt-2 text-xs leading-relaxed text-neutral-600">
								Tindakan ini akan menghapus akun dari memori server secara permanen.
							</p>
							<div className="mt-6 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => setDeleteId(null)}
									className="rounded-md border border-[#E5E2DC] bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={confirmDelete}
									disabled={deleteLoading}
									className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold !text-white hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5"
								>
									{deleteLoading ? "Menghapus..." : "Ya, Hapus Akun"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AdminShell>
	);
}
