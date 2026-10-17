import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db, getUserRole, removeUserRole, setUserRole } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const userRoleSchema = z.object({
	userId: z.string(),
	role: z.enum(["admin", "user"]),
});

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.user.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		role: getUserRole(u.id),
		emailVerified: !!u.emailVerified,
		createdAt: u.createdAt.toISOString(),
	}));
});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(userRoleSchema)
	.handler(async ({ data }) => {
		const { user: caller } = await requireAdmin();
		if (caller.id === data.userId && data.role !== "admin") {
			const err = new Error(
				"Anda tidak dapat menurunkan peran (self-demotion) akun Anda sendiri.",
			) as Error & { status?: number };
			err.status = 400;
			throw err;
		}
		setUserRole(data.userId, data.role);
		return { ok: true };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string().min(1, "User ID wajib diisi") }))
	.handler(async ({ data }) => {
		const { user: caller } = await requireAdmin();
		if (caller.id === data.userId) {
			const err = new Error(
				"Anda tidak dapat menghapus akun Anda sendiri (self-deletion).",
			) as Error & { status?: number };
			err.status = 400;
			throw err;
		}
		// Prevent removing the last administrator so the app never locks itself out.
		const role = getUserRole(data.userId);
		if (role === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Tidak dapat menghapus administrator terakhir.") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		db.user = db.user.filter((u) => u.id !== data.userId);
		removeUserRole(data.userId);
		return { ok: true };
	});
