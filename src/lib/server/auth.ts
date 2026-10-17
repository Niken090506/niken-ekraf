import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import {
	SEED_ADMIN_EMAIL,
	SEED_ADMIN_PASSWORD,
	db,
	getUserRole,
	loginRateLimitMap,
} from "@/lib/db";
import { getCurrentSession, requireAuth } from "@/lib/session";

import { z } from "zod";

/**
 * Server-only session lookup. Safe to call from TanStack Router `beforeLoad`
 * (which runs on the client during client navigation) because server
 * functions always execute on the server.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
	return getCurrentSession();
});

/**
 * Returns the signed-in user's role. Read-only and scoped to the caller's own
 * account (never enumerates other users), so it is safe to call from the client.
 */
export const getMyRole = createServerFn({ method: "GET" }).handler(async () => {
	const { user } = await requireAuth();
	return { role: getUserRole(user.id) };
});

/**
 * Simulated rate-limiting guard for login attempts.
 * Max 5 attempts before locking for 60 seconds per email.
 */
export const checkLoginRateLimit = createServerFn({ method: "POST" })
	.validator(z.object({ email: z.string().email("Format email tidak valid") }))
	.handler(async ({ data }) => {
		const key = data.email.toLowerCase().trim();
		const record = loginRateLimitMap.get(key);
		if (record?.lockedUntil) {
			const now = Date.now();
			if (now < record.lockedUntil) {
				const remaining = Math.ceil((record.lockedUntil - now) / 1000);
				return { locked: true, remainingSeconds: remaining };
			}
			// Lockout expired
			loginRateLimitMap.delete(key);
		}
		return { locked: false, remainingSeconds: 0 };
	});

export const reportLoginAttempt = createServerFn({ method: "POST" })
	.validator(
		z.object({
			email: z.string().email("Format email tidak valid"),
			success: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		const key = data.email.toLowerCase().trim();
		if (data.success) {
			loginRateLimitMap.delete(key);
			return { locked: false, attempts: 0 };
		}

		const now = Date.now();
		const current = loginRateLimitMap.get(key) ?? { count: 0, lockedUntil: null };
		const newCount = current.count + 1;

		if (newCount >= 5) {
			const lockDurationMs = 60 * 1000;
			loginRateLimitMap.set(key, { count: newCount, lockedUntil: now + lockDurationMs });
			return { locked: true, remainingSeconds: 60, attempts: newCount };
		}

		loginRateLimitMap.set(key, { count: newCount, lockedUntil: null });
		return { locked: false, attempts: newCount, remainingSeconds: 0 };
	});

/**
 * One-time development seed: creates the administrator account (password
 * hashed by Better Auth) and seeds sample products. Fully idempotent.
 *
 * Called from the client via `useServerFn(seedAdmin)` on the /setup page.
 */
export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
	const existingAdmin = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
	const hasAdmin = Boolean(existingAdmin);

	if (!existingAdmin) {
		await auth.api.signUpEmail({
			body: {
				email: SEED_ADMIN_EMAIL,
				password: SEED_ADMIN_PASSWORD,
				name: "Administrator",
			},
			headers: new Headers(),
		});
	}

	const adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
	if (adminUser) {
		const existingRole = db.userRole.find((r) => r.userId === adminUser.id);
		if (existingRole) {
			existingRole.role = "admin";
		} else {
			db.userRole.push({ userId: adminUser.id, role: "admin" });
		}
	}

	// Idempotent sample products creation: only seed if no products exist yet
	if (db.product.length === 0) {
		const now = new Date().toISOString();
		const sampleProducts = [
			{
				name: "Starter Kit Ekraf",
				description: "Paket permulaan komprehensif bagi pelaku ekonomi kreatif digital.",
				price: 49,
				stock: 24,
				imageUrl:
					"https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=512&auto=format&fit=crop&q=80",
			},
			{
				name: "Web3 Studio Suite",
				description: "Perangkat studio terdesentralisasi untuk kreator aset 3D & animasi.",
				price: 149,
				stock: 12,
				imageUrl:
					"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&auto=format&fit=crop&q=80",
			},
			{
				name: "Enterprise Sovereignty Node",
				description:
					"Sistem hosting mandiri in-memory berkecepatan tinggi dengan enkripsi menyeluruh.",
				price: 499,
				stock: 5,
				imageUrl:
					"https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=512&auto=format&fit=crop&q=80",
			},
		].map((p) => ({
			id: crypto.randomUUID(),
			...p,
			createdAt: now,
			updatedAt: now,
		}));
		db.product.push(...sampleProducts);
	}

	return { ok: true, alreadySeeded: hasAdmin, admin: SEED_ADMIN_EMAIL };
});
