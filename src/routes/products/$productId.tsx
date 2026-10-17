import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Sparkles, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import type { Product } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteProduct, getProducts, updateProduct } from "@/lib/server/products";

export const Route = createFileRoute("/products/$productId")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	component: EditProductRoute,
});

function EditProductRoute() {
	const { productId } = useParams({
		from: "/products/$productId",
	});

	const productQuery = useQuery({
		queryKey: ["product", productId],
		queryFn: async () => {
			const products = await getProducts();
			return products.find((p) => p.id === productId);
		},
		enabled: !!productId,
	});

	return (
		<AdminShell
			title="Edit Produk"
			subtitle="Perbarui informasi katalog produk ekonomi kreatif."
			actions={
				<Link
					to="/products"
					className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
				>
					<ArrowLeft className="size-3.5" />
					<span>Kembali ke Produk</span>
				</Link>
			}
		>
			<div className="mx-auto max-w-2xl">
				{productQuery.isPending && (
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400">
						Memuat data produk...
					</div>
				)}
				{productQuery.isError && (
					<div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-300">
						Error: {(productQuery.error as Error).message}
					</div>
				)}
				{!productQuery.isPending && !productQuery.data && (
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center text-slate-400">
						Produk tidak ditemukan di memori server.
					</div>
				)}
				{productQuery.data && <EditProductForm product={productQuery.data} />}
			</div>
		</AdminShell>
	);
}

function EditProductForm({ product }: { product: Product }) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const updateFn = useServerFn(updateProduct);
	const deleteFn = useServerFn(deleteProduct);

	const [name, setName] = useState(product.name);
	const [description, setDescription] = useState(product.description);
	const [price, setPrice] = useState(String(product.price));
	const [stock, setStock] = useState(String(product.stock));
	const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
	const [imageMode, setImageMode] = useState<"file" | "url">("file");

	const [loading, setLoading] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [error, setError] = useState("");
	const [successMsg, setSuccessMsg] = useState("");
	const [imageError, setImageError] = useState("");
	const [confirmDelete, setConfirmDelete] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync if prop changes
	useEffect(() => {
		setName(product.name);
		setDescription(product.description);
		setPrice(String(product.price));
		setStock(String(product.stock));
		setImageUrl(product.imageUrl || "");
	}, [product]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setImageError("");
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setImageError("Berkas harus berupa gambar.");
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const maxDim = 512;
				let width = img.width;
				let height = img.height;

				if (width > maxDim || height > maxDim) {
					if (width > height) {
						height = Math.round((height * maxDim) / width);
						width = maxDim;
					} else {
						width = Math.round((width * maxDim) / height);
						height = maxDim;
					}
				}

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					setImageError("Gagal merender canvas.");
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);
				const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

				if (resizedDataUrl.length > 700000) {
					setImageError("Ukuran gambar melebihi 512KB.");
					return;
				}

				setImageUrl(resizedDataUrl);
			};
			img.src = event.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccessMsg("");

		if (!name.trim() || !description.trim()) {
			setError("Nama dan deskripsi produk wajib diisi.");
			return;
		}

		const numPrice = Number(price);
		if (!Number.isFinite(numPrice) || numPrice < 0) {
			setError("Harga harus berupa angka positif.");
			return;
		}

		const numStock = Number(stock);
		if (!Number.isFinite(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
			setError("Stok harus berupa bilangan bulat positif.");
			return;
		}

		setLoading(true);

		try {
			await updateFn({
				data: {
					id: product.id,
					name: name.trim(),
					description: description.trim(),
					price: numPrice,
					stock: numStock,
					imageUrl: imageUrl || null,
				},
			});

			setSuccessMsg("Produk berhasil diperbarui.");
			await queryClient.invalidateQueries({ queryKey: ["products"] });
			await queryClient.invalidateQueries({ queryKey: ["product", product.id] });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setDeleteLoading(true);
		try {
			await deleteFn({ data: { id: product.id } });
			await queryClient.invalidateQueries({ queryKey: ["products"] });
			navigate({ to: "/products" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal menghapus produk.");
			setDeleteLoading(false);
			setConfirmDelete(false);
		}
	};

	return (
		<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<span className="flex size-7 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
						<Sparkles className="size-4" />
					</span>
					<h2 className="font-serif text-lg font-medium text-white">Edit Rincian Produk</h2>
				</div>
				<button
					type="button"
					onClick={() => setConfirmDelete(true)}
					className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
				>
					<Trash2 className="size-3.5" />
					<span>Hapus</span>
				</button>
			</div>

			{error && (
				<div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
					{error}
				</div>
			)}
			{successMsg && (
				<div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
					{successMsg}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-1.5">
					<label htmlFor="name" className="text-xs font-medium text-slate-300">
						Nama Produk
					</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
					/>
				</div>

				<div className="space-y-1.5">
					<label htmlFor="description" className="text-xs font-medium text-slate-300">
						Deskripsi
					</label>
					<textarea
						id="description"
						rows={4}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
						className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<label htmlFor="price" className="text-xs font-medium text-slate-300">
							Harga ($)
						</label>
						<input
							id="price"
							type="number"
							step="0.01"
							min="0"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							required
							className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
						/>
					</div>
					<div className="space-y-1.5">
						<label htmlFor="stock" className="text-xs font-medium text-slate-300">
							Stok
						</label>
						<input
							id="stock"
							type="number"
							step="1"
							min="0"
							value={stock}
							onChange={(e) => setStock(e.target.value)}
							required
							className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
						/>
					</div>
				</div>

				{/* Image Picker */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-slate-300">Gambar Produk (Maks 512px)</span>
						<div className="flex items-center gap-1 text-[11px]">
							<button
								type="button"
								onClick={() => setImageMode("file")}
								className={`rounded-full px-2 py-0.5 font-medium transition-colors ${
									imageMode === "file" ? "bg-teal-400/20 text-teal-300" : "text-slate-400"
								}`}
							>
								Unggah Berkas
							</button>
							<button
								type="button"
								onClick={() => setImageMode("url")}
								className={`rounded-full px-2 py-0.5 font-medium transition-colors ${
									imageMode === "url" ? "bg-teal-400/20 text-teal-300" : "text-slate-400"
								}`}
							>
								Tautan URL
							</button>
						</div>
					</div>

					{imageMode === "file" ? (
						<div className="flex items-center gap-3">
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileChange}
								accept="image/*"
								className="hidden"
							/>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] py-3 text-xs text-slate-300 transition-colors hover:border-teal-400/40 hover:bg-white/[0.05]"
							>
								<Upload className="size-4 text-teal-400" />
								<span>Pilih Gambar (Otomatis Downscale ke 512px)</span>
							</button>
						</div>
					) : (
						<input
							type="url"
							value={imageUrl}
							onChange={(e) => setImageUrl(e.target.value)}
							placeholder="https://..."
							className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-400/50 focus:outline-none"
						/>
					)}

					{imageError && <p className="text-[11px] text-red-400">{imageError}</p>}

					{imageUrl && (
						<div className="relative mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2">
							<img src={imageUrl} alt="Pratinjau" className="size-12 rounded-lg object-cover" />
							<div className="min-w-0 flex-1 text-[11px]">
								<p className="font-semibold text-teal-300">Gambar Produk Aktif</p>
								<p className="truncate text-slate-400">Dimensi maks 512px</p>
							</div>
							<button
								type="button"
								onClick={() => setImageUrl("")}
								className="rounded-lg p-1 text-slate-400 hover:text-red-400"
								title="Hapus gambar"
							>
								<X className="size-4" />
							</button>
						</div>
					)}
				</div>

				<div className="flex items-center justify-end gap-3 pt-4">
					<Link
						to="/products"
						className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
					>
						Batal
					</Link>
					<button
						type="submit"
						disabled={loading}
						className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 px-6 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] active:scale-[0.98] disabled:opacity-50"
					>
						{loading && <Loader2 className="size-3.5 animate-spin" />}
						<span>Simpan Perubahan</span>
					</button>
				</div>
			</form>

			{/* Delete modal */}
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
						<h3 className="font-serif text-lg font-medium text-white">Hapus Produk Ini?</h3>
						<p className="mt-2 text-xs leading-relaxed text-slate-400">
							Tindakan ini tidak dapat dibatalkan. Produk akan segera dihapus dari memori server.
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
	);
}
