import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createColumnHelper, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import {
	ArrowUpDown,
	CheckCircle2,
	Eye,
	ShieldAlert,
	ShieldCheck,
	Trash2,
	User,
	XCircle,
} from "lucide-react";
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
								<div className="flex size-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 font-bold text-teal-300">
									{u.name?.charAt(0).toUpperCase() || <User className="size-4" />}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-white">{u.name || "Tanpa Nama"}</span>
										{isSelf && (
											<span className="rounded-full border border-teal-400/30 bg-teal-400/15 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
												Akun Anda
											</span>
										)}
									</div>
									<p className="font-mono text-[11px] text-slate-400">{u.email}</p>
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
									className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none ${
										user.role === "admin"
											? "border-teal-500/30 bg-teal-500/15 text-teal-300"
											: "border-white/10 bg-white/5 text-slate-300"
									} ${isSelf ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-teal-400/40"}`}
								>
									<option value="user" className="bg-[#07171d] text-slate-200">
										Pengguna (User)
									</option>
									<option value="admin" className="bg-[#07171d] text-teal-300">
										Administrator (Admin)
									</option>
								</select>
								{isSelf && (
									<span title="Anti Self-Demotion" className="text-teal-400">
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
							<span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
								<CheckCircle2 className="size-3.5" />
								<span>Terverifikasi</span>
							</span>
						) : (
							<span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
								<XCircle className="size-3.5" />
								<span>Belum</span>
							</span>
						),
				}),
				columnHelper.accessor("createdAt", {
					header: "Terdaftar",
					cell: (info) => (
						<span className="text-[11px] text-slate-400">
							{new Date(info.getValue() as string).toLocaleDateString("id-ID", {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</span>
					),
				}),
				columnHelper.display({
					id: "actions",
					header: "Aksi",
					cell: (info) => {
						const user = info.row.original as UserRow;
						const isSelf = user.id === currentUserId;
						const isLastAdmin = user.role === "admin" && adminCount <= 1;

						return (
							<div className="flex items-center gap-2">
								<Link
									to="/users/$userId"
									params={{ userId: user.id }}
									className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
									title="Rincian Pengguna"
								>
									<Eye className="size-3.5" />
								</Link>

								{isSelf ? (
									<span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-500">
										Akun Aktif
									</span>
								) : isLastAdmin ? (
									<span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-300">
										Admin Terakhir
									</span>
								) : (
									<button
										type="button"
										onClick={() => {
											setDeleteId(user.id);
											setActionError("");
										}}
										className="flex size-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
										title="Hapus Pengguna"
									>
										<Trash2 className="size-3.5" />
									</button>
								)}
							</div>
						);
					},
				}),
			]),
		[columnHelper, currentUserId, adminCount, updateRoleFn, queryClient],
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
			setActionSuccess("Pengguna berhasil dihapus.");
			await queryClient.invalidateQueries({ queryKey: ["users"] });
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
			subtitle="Kontrol akses pengguna dan peran administrator dengan pengamanan anti self-demotion dan last admin guard."
		>
			<div className="space-y-6">
				{/* Feedback alerts */}
				{actionError && (
					<div className="flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
						<ShieldAlert className="size-4 shrink-0 mt-0.5" />
						<p>{actionError}</p>
					</div>
				)}
				{actionSuccess && (
					<div className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
						<CheckCircle2 className="size-4 shrink-0 mt-0.5" />
						<p>{actionSuccess}</p>
					</div>
				)}

				{/* Table Container */}
				<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id} className="border-b border-white/10 bg-white/[0.02]">
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												colSpan={header.colSpan}
												className="px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-400 uppercase"
											>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody className="divide-y divide-white/5 text-slate-300">
								{table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="transition-colors hover:bg-white/[0.02] hover:text-white"
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
										<td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
											{usersQuery.isPending
												? "Memuat data pengguna..."
												: "Belum ada pengguna terdaftar."}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Delete Confirmation Modal */}
				{deleteId && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/70 backdrop-blur-sm"
							onClick={() => setDeleteId(null)}
							onKeyDown={(e) => {
								if (e.key === "Escape") setDeleteId(null);
							}}
							role="presentation"
						/>
						<div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#07171d] p-6 shadow-2xl backdrop-blur-xl">
							<h3 className="font-serif text-lg font-medium text-white">Hapus Pengguna Ini?</h3>
							<p className="mt-2 text-xs leading-relaxed text-slate-400">
								Akun pengguna ini akan dihapus dari sistem memori server dan sesi login akan
								dihentikan.
							</p>
							<div className="mt-6 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => setDeleteId(null)}
									className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={confirmDelete}
									disabled={deleteLoading}
									className="rounded-full bg-red-500/80 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-500 disabled:opacity-50"
								>
									{deleteLoading ? "Menghapus..." : "Ya, Hapus"}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</AdminShell>
	);
}
