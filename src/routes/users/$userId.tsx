import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	ArrowLeft,
	Calendar,
	CheckCircle2,
	Mail,
	ShieldAlert,
	ShieldCheck,
	Trash2,
	User as UserIcon,
	XCircle,
} from "lucide-react";
import { useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteUser, getUsers, updateUserRole } from "@/lib/server/users";

export const Route = createFileRoute("/users/$userId")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	component: UserDetail,
});

function UserDetail() {
	const { userId } = useParams({
		from: "/users/$userId",
	});

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const currentUserId = session?.user?.id;

	const updateRoleFn = useServerFn(updateUserRole);
	const deleteFn = useServerFn(deleteUser);

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => getUsers(),
	});

	const [statusMsg, setStatusMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const users = usersQuery.data ?? [];
	const user = users.find((u) => u.id === userId);
	const adminCount = users.filter((u) => u.role === "admin").length;

	const isSelf = user?.id === currentUserId;
	const isLastAdmin = user?.role === "admin" && adminCount <= 1;

	const handleRoleChange = async (nextRole: Role) => {
		if (!user || nextRole === user.role) return;
		setErrorMsg("");
		setStatusMsg("");

		if (isSelf && nextRole !== "admin") {
			setErrorMsg("Anda tidak dapat menurunkan peran (self-demotion) akun Anda sendiri.");
			return;
		}

		try {
			await updateRoleFn({
				data: {
					userId: user.id,
					role: nextRole,
				},
			});
			setStatusMsg(`Peran pengguna berhasil diubah menjadi ${nextRole}.`);
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengubah peran pengguna.");
		}
	};

	const handleDelete = async () => {
		if (!user) return;
		if (isSelf) {
			setErrorMsg("Anda tidak dapat menghapus akun Anda sendiri.");
			return;
		}
		if (isLastAdmin) {
			setErrorMsg("Tidak dapat menghapus administrator terakhir di sistem.");
			return;
		}

		setDeleteLoading(true);
		try {
			await deleteFn({ data: { userId: user.id } });
			await queryClient.invalidateQueries({ queryKey: ["users"] });
			navigate({ to: "/users" });
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal menghapus pengguna.");
			setDeleteLoading(false);
			setConfirmDelete(false);
		}
	};

	return (
		<AdminShell
			title="Rincian Pengguna"
			subtitle="Informasi detail akun dan kontrol peran akses."
			actions={
				<Link
					to="/users"
					className="inline-flex items-center gap-1.5 rounded-none border border-[#E5E2DC] bg-white px-4 py-2 text-xs font-bold tracking-wider text-neutral-800 uppercase hover:bg-neutral-100"
				>
					<ArrowLeft className="size-3.5" />
					<span>Kembali ke Daftar Pengguna</span>
				</Link>
			}
		>
			<div className="mx-auto max-w-2xl">
				{usersQuery.isPending && (
					<div className="rounded-xl border border-[#E5E2DC] bg-white p-12 text-center text-sm text-neutral-500">
						Memuat rincian pengguna...
					</div>
				)}

				{!usersQuery.isPending && !user && (
					<div className="rounded-xl border border-[#E5E2DC] bg-white p-12 text-center text-sm text-neutral-500">
						Pengguna tidak ditemukan di sistem.
					</div>
				)}

				{user && (
					<div className="rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs sm:p-8">
						{/* Alerts */}
						{errorMsg && (
							<div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600">
								<ShieldAlert className="size-4 shrink-0 mt-0.5" />
								<p>{errorMsg}</p>
							</div>
						)}
						{statusMsg && (
							<div className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
								<CheckCircle2 className="size-4 shrink-0 mt-0.5" />
								<p>{statusMsg}</p>
							</div>
						)}

						{/* Profile Card Header */}
						<div className="flex items-center gap-4 border-b border-[#E5E2DC] pb-6">
							<div className="flex size-14 items-center justify-center rounded-full bg-[#111111] text-xl font-bold text-white shadow-xs">
								{user.name?.charAt(0).toUpperCase() || <UserIcon className="size-6" />}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h2 className="font-serif text-xl font-bold text-neutral-950 uppercase tracking-wide">
										{user.name || "Tanpa Nama"}
									</h2>
									{isSelf && (
										<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-800">
											Akun Anda
										</span>
									)}
								</div>
								<p className="text-xs text-neutral-500">{user.email}</p>
							</div>
						</div>

						{/* Info Grid */}
						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-4">
								<div className="flex items-center gap-2 text-xs font-bold text-neutral-600 uppercase tracking-wider">
									<Mail className="size-3.5" />
									<span>Status Verifikasi</span>
								</div>
								<div className="mt-2 flex items-center gap-1.5">
									{user.emailVerified ? (
										<span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
											<CheckCircle2 className="size-4" />
											Terverifikasi
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400">
											<XCircle className="size-4" />
											Belum Terverifikasi
										</span>
									)}
								</div>
							</div>

							<div className="rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-4">
								<div className="flex items-center gap-2 text-xs font-bold text-neutral-600 uppercase tracking-wider">
									<Calendar className="size-3.5" />
									<span>Waktu Pendaftaran</span>
								</div>
								<p className="mt-2 text-xs font-bold text-neutral-900">
									{new Date(user.createdAt).toLocaleDateString("id-ID", {
										dateStyle: "long",
									})}
								</p>
							</div>
						</div>

						{/* Role Selection section */}
						<div className="mt-6 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
										Peran Akun (Role)
									</p>
									<p className="text-[11px] text-neutral-500">
										{isSelf
											? "Peran akun sendiri tidak dapat diubah (Anti Self-Demotion aktif)."
											: "Pilih peran hak akses untuk pengguna ini."}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<select
										value={user.role}
										onChange={(e) => handleRoleChange(e.target.value as Role)}
										disabled={isSelf}
										className={`rounded-md border px-3 py-1.5 text-xs font-bold transition-all focus:outline-none ${
											user.role === "admin"
												? "border-black bg-[#111111] text-white"
												: "border-[#E5E2DC] bg-white text-neutral-800"
										} ${isSelf ? "cursor-not-allowed opacity-75" : "cursor-pointer hover:border-black"}`}
									>
										<option value="user" className="bg-white text-neutral-900">
											Pengguna (User)
										</option>
										<option value="admin" className="bg-white text-neutral-900">
											Administrator (Admin)
										</option>
									</select>
									{isSelf && (
										<span title="Terlindungi" className="text-neutral-700">
											<ShieldCheck className="size-4" />
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Delete user section */}
						<div className="mt-8 border-t border-[#E5E2DC] pt-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-bold text-red-600 uppercase tracking-wider">
										Zona Berbahaya
									</p>
									<p className="text-[11px] text-neutral-500">
										Menghapus akun ini secara permanen dari server in-memory.
									</p>
								</div>
								<button
									type="button"
									disabled={isSelf || isLastAdmin}
									onClick={() => setConfirmDelete(true)}
									className={`rounded-none px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
										isSelf || isLastAdmin
											? "cursor-not-allowed border border-neutral-200 bg-neutral-100 text-neutral-400 opacity-60"
											: "border border-red-300 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
									}`}
								>
									Hapus Akun
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Confirm Delete Dialog */}
				{confirmDelete && user && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/50 backdrop-blur-xs"
							onClick={() => setConfirmDelete(false)}
							onKeyDown={(e) => {
								if (e.key === "Escape") setConfirmDelete(false);
							}}
							role="presentation"
						/>
						<div className="relative w-full max-w-sm rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xl">
							<h3 className="font-serif text-lg font-bold text-neutral-950 uppercase">
								Hapus Pengguna Ini?
							</h3>
							<p className="mt-2 text-xs leading-relaxed text-neutral-600">
								Apakah Anda yakin ingin menghapus akun <strong>{user.email}</strong>? Tindakan ini
								tidak dapat dibatalkan.
							</p>
							<div className="mt-6 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => setConfirmDelete(false)}
									className="rounded-md border border-[#E5E2DC] bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={handleDelete}
									disabled={deleteLoading}
									className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
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
