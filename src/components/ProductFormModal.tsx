import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
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
					setImageError("Ukuran gambar terlalu besar setelah kompresi. Coba gunakan foto lain.");
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

		const numPrice = Number.parseFloat(price);
		const numStock = Number.parseInt(stock, 10);

		if (Number.isNaN(numPrice) || numPrice < 0) {
			setError("Harga produk harus berupa angka non-negatif.");
			return;
		}
		if (Number.isNaN(numStock) || numStock < 0) {
			setError("Stok produk harus berupa bilangan bulat non-negatif.");
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
				className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Escape") onClose();
				}}
				role="presentation"
			/>

			{/* Modal Dialog */}
			<div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-2xl sm:p-8">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
					<h2 className="font-serif text-lg font-bold text-neutral-950 uppercase tracking-wide">
						{product ? "Edit Produk Katalog" : "Tambah Produk Baru"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-black"
					>
						<X className="size-4" />
					</button>
				</div>

				{/* Error feedback */}
				{error && (
					<div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="mt-5 space-y-4">
					{/* Name */}
					<div className="space-y-1">
						<label
							htmlFor="prod-name"
							className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
						>
							Nama Produk
						</label>
						<input
							id="prod-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Minimalist Leather Sneaker"
							required
							className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
						/>
					</div>

					{/* Description */}
					<div className="space-y-1">
						<label
							htmlFor="prod-desc"
							className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
						>
							Deskripsi
						</label>
						<textarea
							id="prod-desc"
							rows={3}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Jelaskan spesifikasi, material, atau keunggulan karya..."
							required
							className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
						/>
					</div>

					{/* Price & Stock */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<label
								htmlFor="prod-price"
								className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
							>
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
								className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
							/>
						</div>
						<div className="space-y-1">
							<label
								htmlFor="prod-stock"
								className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
							>
								Stok (Unit)
							</label>
							<input
								id="prod-stock"
								type="number"
								step="1"
								min="0"
								value={stock}
								onChange={(e) => setStock(e.target.value)}
								placeholder="10"
								required
								className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
							/>
						</div>
					</div>

					{/* Image Selection with 512px Downscaling */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
								Foto Produk
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setImageMode("file")}
									className={`text-[11px] font-bold tracking-wide uppercase ${
										imageMode === "file"
											? "text-black underline underline-offset-4"
											: "text-neutral-400 hover:text-black"
									}`}
								>
									Unggah Berkas
								</button>
								<span className="text-neutral-300">|</span>
								<button
									type="button"
									onClick={() => setImageMode("url")}
									className={`text-[11px] font-bold tracking-wide uppercase ${
										imageMode === "url"
											? "text-black underline underline-offset-4"
											: "text-neutral-400 hover:text-black"
									}`}
								>
									Tautan URL
								</button>
							</div>
						</div>

						{imageMode === "file" ? (
							<div>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									className="hidden"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#E5E2DC] bg-[#F9F8F6] py-3.5 text-xs font-medium text-neutral-700 transition-colors hover:border-black hover:bg-neutral-100"
								>
									<Upload className="size-4 text-neutral-600" />
									<span>Pilih Gambar (Otomatis Kompres & Downscale 512px)</span>
								</button>
							</div>
						) : (
							<input
								type="url"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								placeholder="https://images.unsplash.com/photo-..."
								className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:outline-none"
							/>
						)}

						{imageError && <p className="text-[11px] text-red-600 font-semibold">{imageError}</p>}

						{/* Image Preview */}
						{imageUrl && (
							<div className="relative mt-2 flex items-center gap-3 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-2">
								<img
									src={imageUrl}
									alt="Pratinjau"
									className="size-12 rounded-md object-cover border border-[#E5E2DC]"
								/>
								<div className="min-w-0 flex-1 text-[11px]">
									<p className="font-bold text-neutral-900">Gambar Terpilih</p>
									<p className="truncate text-neutral-500">Siap disimpan (downscaled max 512px)</p>
								</div>
								<button
									type="button"
									onClick={() => setImageUrl("")}
									className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
									title="Hapus gambar"
								>
									<X className="size-4" />
								</button>
							</div>
						)}
					</div>

					{/* Modal Actions */}
					<div className="flex items-center justify-end gap-3 border-t border-[#E5E2DC] pt-4">
						<button
							type="button"
							onClick={onClose}
							className="rounded-none border border-[#E5E2DC] bg-white px-5 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 uppercase tracking-wider"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={loading}
							className="inline-flex items-center gap-1.5 rounded-none bg-[#111111] px-6 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-neutral-800 shadow-sm disabled:opacity-50"
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
