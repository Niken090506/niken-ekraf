import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Image as ImageIcon, Loader2, Sparkles, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Product } from "@/lib/db";
import { createProduct, updateProduct } from "@/lib/server/products";

interface ProductFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	product?: Product | null;
	onSuccess?: () => void;
}

export function ProductFormModal({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) {
	const queryClient = useQueryClient();
	const createFn = useServerFn(createProduct);
	const updateFn = useServerFn(updateProduct);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [imageMode, setImageMode] = useState<"file" | "url">("file");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageError, setImageError] = useState("");

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Sync state when product prop changes or modal opens
	useEffect(() => {
		if (isOpen) {
			if (product) {
				setName(product.name);
				setDescription(product.description);
				setPrice(String(product.price));
				setStock(String(product.stock));
				setImageUrl(product.imageUrl || "");
			} else {
				setName("");
				setDescription("");
				setPrice("");
				setStock("");
				setImageUrl("");
			}
			setError("");
			setImageError("");
		}
	}, [isOpen, product]);

	if (!isOpen) return null;

	// Handle Image File selection with automatic client-side resizing to max 512px
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setImageError("");
		const file = e.target.files?.[0];
		if (!file) return;

		// Check file type
		if (!file.type.startsWith("image/")) {
			setImageError("Berkas harus berupa gambar (PNG, JPG, WebP).");
			return;
		}

		// Read file and downscale on HTML5 Canvas to max 512px
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
					setImageError("Gagal memproses gambar pada canvas.");
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);
				const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

				// Safety check on base64 size (should be under 400KB easily after 512px downscale)
				if (resizedDataUrl.length > 700000) {
					setImageError("Ukuran gambar melebihi 512KB. Silakan pilih gambar yang lebih kecil.");
					return;
				}

				setImageUrl(resizedDataUrl);
			};
			img.onerror = () => {
				setImageError("Gagal membaca berkas gambar.");
			};
			img.src = event.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name.trim()) {
			setError("Nama produk wajib diisi.");
			return;
		}
		if (!description.trim()) {
			setError("Deskripsi produk wajib diisi.");
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
			if (product) {
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
			} else {
				await createFn({
					data: {
						name: name.trim(),
						description: description.trim(),
						price: numPrice,
						stock: numStock,
						imageUrl: imageUrl || null,
					},
				});
			}

			await queryClient.invalidateQueries({ queryKey: ["products"] });
			await queryClient.invalidateQueries({ queryKey: ["dashboard", "products"] });
			onSuccess?.();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal menyimpan data produk.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Escape") onClose();
				}}
				role="presentation"
			/>

			{/* Modal Dialog */}
			<div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#07171d]/95 p-6 shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-8">
				{/* Header */}
				<div className="flex items-center justify-between pb-4">
					<div className="flex items-center gap-2">
						<span className="flex size-7 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
							<Sparkles className="size-4" />
						</span>
						<h2 className="font-serif text-xl font-normal text-white">
							{product ? "Edit Produk" : "Tambah Produk Baru"}
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-white/10 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
					>
						<X className="size-4" />
					</button>
				</div>

				{/* Error feedback */}
				{error && (
					<div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Name */}
					<div className="space-y-1.5">
						<label htmlFor="prod-name" className="text-xs font-medium text-slate-300">
							Nama Produk
						</label>
						<input
							id="prod-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Starter Kit Ekraf"
							required
							className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
						/>
					</div>

					{/* Description */}
					<div className="space-y-1.5">
						<label htmlFor="prod-desc" className="text-xs font-medium text-slate-300">
							Deskripsi
						</label>
						<textarea
							id="prod-desc"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Jelaskan spesifikasi, keunggulan, atau lisensi produk..."
							required
							className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
						/>
					</div>

					{/* Price & Stock */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<label htmlFor="prod-price" className="text-xs font-medium text-slate-300">
								Harga ($)
							</label>
							<input
								id="prod-price"
								type="number"
								step="0.01"
								min="0"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="0.00"
								required
								className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="prod-stock" className="text-xs font-medium text-slate-300">
								Stok
							</label>
							<input
								id="prod-stock"
								type="number"
								step="1"
								min="0"
								value={stock}
								onChange={(e) => setStock(e.target.value)}
								placeholder="0"
								required
								className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
							/>
						</div>
					</div>

					{/* Image Input (File Picker with 512px auto-downscale or URL) */}
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
								placeholder="https://images.unsplash.com/photo-..."
								className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-400/50 focus:outline-none"
							/>
						)}

						{imageError && <p className="text-[11px] text-red-400">{imageError}</p>}

						{/* Image Preview */}
						{imageUrl && (
							<div className="relative mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2">
								<img src={imageUrl} alt="Pratinjau" className="size-12 rounded-lg object-cover" />
								<div className="min-w-0 flex-1 text-[11px]">
									<p className="font-semibold text-teal-300">Gambar Terpilih</p>
									<p className="truncate text-slate-400">Siap disimpan (maks 512px)</p>
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

					{/* Modal Actions */}
					<div className="flex items-center justify-end gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={loading}
							className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 px-6 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] active:scale-[0.98] disabled:opacity-50"
						>
							{loading && <Loader2 className="size-3.5 animate-spin" />}
							<span>{product ? "Simpan Perubahan" : "Buat Produk"}</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
