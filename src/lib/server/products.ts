import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Product, db } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/session";

export const productSchema = z.object({
	name: z.string().trim().min(1, "Nama produk wajib diisi").max(100, "Nama maksimal 100 karakter"),
	description: z
		.string()
		.trim()
		.min(1, "Deskripsi wajib diisi")
		.max(1000, "Deskripsi maksimal 1000 karakter"),
	price: z.coerce
		.number()
		.min(0, "Harga harus berupa angka positif")
		.max(1_000_000_000, "Harga melebihi batas wajar"),
	stock: z.coerce
		.number()
		.int("Stok harus berupa bilangan bulat")
		.min(0, "Stok harus berupa angka positif")
		.max(1_000_000, "Stok melebihi batas wajar"),
	imageUrl: z
		.string()
		.max(700_000, "Ukuran gambar terlalu besar (maksimal 512px / ~500KB)")
		.refine(
			(val) =>
				!val ||
				val.startsWith("http://") ||
				val.startsWith("https://") ||
				val.startsWith("data:image/"),
			"Format URL atau data gambar tidak valid (harus http, https, atau data:image/)",
		)
		.optional()
		.nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;

// TanStack Start server functions support GET and POST only. Mutations use
// POST and encode the intended action in the validator/body.
export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAuth();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const getProductById = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1, "ID produk wajib diisi") }))
	.handler(async ({ data }) => {
		await requireAuth();
		const product = db.product.find((p) => p.id === data.id);
		if (!product) {
			const err = new Error("Produk tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		return product;
	});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const now = new Date().toISOString();
		const product: Product = {
			id: crypto.randomUUID(),
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			imageUrl: data.imageUrl ?? undefined,
			createdAt: now,
			updatedAt: now,
		};
		db.product.push(product);
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string().min(1, "ID produk wajib diisi"),
			...productSchema.shape,
		}),
	)
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Produk tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const now = new Date().toISOString();
		const updated: Product = {
			...db.product[index],
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			imageUrl: data.imageUrl ?? db.product[index].imageUrl,
			updatedAt: now,
		};
		db.product[index] = updated;
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().min(1, "ID produk wajib diisi") }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Produk tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		db.product.splice(index, 1);
		return { ok: true };
	});
