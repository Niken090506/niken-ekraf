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
		setStatusMsg("");
		setErrorMsg("");

		if (isSelf && nextRole !== "admin") {
			setErrorMsg("Anda tidak dapat menurunkan peran (self-demotion) akun Anda sendiri.");
			return;
		}

		try {
			await updateRoleFn({ data: { userId: user.id, role: nextRole } });
			setStatusMsg(`Peran berhasil diubah menjadi ${nextRole}.`);
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (err) {
			setErrorMsg(err instanceof Error ? err.message : "Gagal mengubah peran.");
		}
	};

	const handleDelete = async () => {
		if (!user) return;
		setDeleteLoading(true);
		setErrorMsg("");

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
					className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
				>
					<ArrowLeft className="size-3.5" />
					<span>Kembali ke Daftar Pengguna</span>
				</Link>
			}
		>
			<div className="mx-auto max-w-2xl">
				{usersQuery.isPending && (
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400">
						Memuat rincian pengguna...
					</div>
				)}

				{!usersQuery.isPending && !user && (
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400">
						Pengguna tidak ditemukan di sistem.
					</div>
				)}

				{user && (
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
						{/* Alerts */}
						{errorMsg && (
							<div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
								<ShieldAlert className="size-4 shrink-0 mt-0.5" />
								<p>{errorMsg}</p>
							</div>
						)}
						{statusMsg && (
							<div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
								<CheckCircle2 className="size-4 shrink-0 mt-0.5" />
								<p>{statusMsg}</p>
							</div>
						)}

						{/* Profile Card Header */}
						<div className="flex items-center gap-4 border-b border-white/10 pb-6">
							<div className="flex size-14 items-center justify-center rounded-2xl border border-teal-500/25 bg-teal-500/10 text-xl font-bold text-teal-300 shadow-[0_0_20px_rgba(45,212,191,0.2)]">
								{user.name?.charAt(0).toUpperCase() || <UserIcon className="size-6" />}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h2 className="font-serif text-xl font-medium text-white">
										{user.name || "Tanpa Nama"}
									</h2>
									{isSelf && (
										<span className="rounded-full border border-teal-400/30 bg-teal-400/15 px-2.5 py-0.5 text-xs font-semibold text-teal-300">
											Akun Anda
										</span>
									)}
								</div>
								<p className="font-mono text-xs text-slate-400">{user.email}</p>
							</div>
						</div>

						{/* Info Grid */}
						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
								<div className="flex items-center gap-2 text-xs text-slate-400">
									<Mail className="size-3.5" />
									<span>Status Verifikasi Email</span>
								</div>
								<div className="mt-2 flex items-center gap-1.5">
									{user.emailVerified ? (
										<span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
											<CheckCircle2 className="size-4" />
											Terverifikasi
										</span>
									) : (
										<span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
											<XCircle className="size-4" />
											Belum Terverifikasi
										</span>
									)}
								</div>
							</div>

							<div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
								<div className="flex items-center gap-2 text-xs text-slate-400">
									<Calendar className="size-3.5" />
									<span>Waktu Pendaftaran</span>
								</div>
								<p className="mt-2 text-xs font-semibold text-slate-200">
									{new Date(user.createdAt).toLocaleDateString("id-ID", {
										dateStyle: "long",
									})}
								</p>
							</div>
						</div>

						{/* Role Selection section */}
						<div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs font-semibold text-slate-300">Peran Akun (Role)</p>
									<p className="text-[11px] text-slate-400">
										{isSelf
											? "Peran akun sendiri tidak dapat diubah (proteksi anti self-demotion)."
											: "Tentukan tingkat hak akses akun dalam sistem."}
									</p>
								</div>
								<select
									value={user.role}
									onChange={(e) => handleRoleChange(e.target.value as Role)}
									disabled={isSelf}
									className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
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
							</div>
						</div>

						{/* Bottom Actions */}
						<div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
							<div>
								{isSelf && (
									<p className="text-xs text-slate-500">
										Akun yang sedang aktif tidak dapat dihapus sendiri (anti self-deletion).
									</p>
								)}
								{!isSelf && isLastAdmin && (
									<p className="text-xs text-amber-400">
										Akun administrator terakhir tidak dapat dihapus untuk mencegah lockout sistem.
									</p>
								)}
							</div>

							{!isSelf && !isLastAdmin && (
								<button
									type="button"
									onClick={() => setConfirmDelete(true)}
									className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
								>
									<Trash2 className="size-3.5" />
									<span>Hapus Pengguna</span>
								</button>
							)}
						</div>

						{/* Delete Confirmation Modal */}
						{confirmDelete && (
							<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
								<div
									className="fixed inset-0 bg-black/70 backdrop-blur-sm"
									onClick={() => setConfirmDelete(false)}
									onKeyDown={(e) => {
										if (e.key === "Escape") setConfirmDelete(false);
									}}
									role="presentation"
								/>
								<div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#07171d] p-6 shadow-2xl backdrop-blur-xl">
									<h3 className="font-serif text-lg font-medium text-white">Hapus Pengguna Ini?</h3>
									<p className="mt-2 text-xs leading-relaxed text-slate-400">
										Akun pengguna <strong>{user.email}</strong> akan segera dihapus permanen dari
										memori server.
									</p>
									<div className="mt-6 flex items-center justify-end gap-3">
										<button
											type="button"
											onClick={() => setConfirmDelete(false)}
											className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
										>
											Batal
										</button>
										<button
											type="button"
											onClick={handleDelete}
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
				)}
			</div>
		</AdminShell>
	);
}
