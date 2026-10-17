import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { getServerSession } from "@/lib/server/auth";
import { createProduct } from "@/lib/server/products";

export const Route = createFileRoute("/products/new")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	component: NewProductPage,
});

function NewProductPage() {
	const navigate = useNavigate();
	const createFn = useServerFn(createProduct);

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
					setImageError("Gagal memproses gambar pada canvas.");
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);
				const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);

				if (resizedDataUrl.length > 700000) {
					setImageError("Ukuran gambar terlalu besar setelah kompresi.");
					return;
				}

				setImageUrl(resizedDataUrl);
			};
			img.onerror = () => {
				setImageError("Gagal membaca file gambar.");
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
			setError("Harga produk harus berupa angka valid non-negatif.");
			return;
		}
		if (Number.isNaN(numStock) || numStock < 0) {
			setError("Stok produk harus berupa bilangan bulat non-negatif.");
			return;
		}

		setLoading(true);

		try {
			await createFn({
				data: {
					name: name.trim(),
					description: description.trim(),
					price: numPrice,
					stock: numStock,
					imageUrl: imageUrl || null,
				},
			});

			navigate({ to: "/products" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal membuat produk.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AdminShell
			title="Tambah Produk Baru"
			subtitle="Input data katalog produk ekonomi kreatif dengan validasi instan."
			actions={
				<Link
					to="/products"
					className="inline-flex items-center gap-1.5 rounded-none border border-[#E5E2DC] bg-white px-4 py-2 text-xs font-bold tracking-wider text-neutral-800 uppercase hover:bg-neutral-100"
				>
					<ArrowLeft className="size-3.5" />
					<span>Kembali ke Produk</span>
				</Link>
			}
		>
			<div className="mx-auto max-w-2xl">
				<div className="rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs sm:p-8">
					<div className="mb-6 border-b border-[#E5E2DC] pb-4">
						<h2 className="font-serif text-lg font-bold tracking-wide text-neutral-950 uppercase">
							Formulir Produk
						</h2>
					</div>

					{error && (
						<div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1">
							<label
								htmlFor="name"
								className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
							>
								Nama Produk
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Platform GIS FoodLoop / Tenun Ikat Sumba"
								required
								className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
							/>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="description"
								className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
							>
								Deskripsi
							</label>
							<textarea
								id="description"
								rows={4}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Jelaskan spesifikasi produk, material, dan keunggulan..."
								required
								className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<label
									htmlFor="price"
									className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
								>
									Harga ($)
								</label>
								<input
									id="price"
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
									htmlFor="stock"
									className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
								>
									Stok
								</label>
								<input
									id="stock"
									type="number"
									step="1"
									min="0"
									value={stock}
									onChange={(e) => setStock(e.target.value)}
									placeholder="0"
									required
									className="w-full rounded-lg border border-[#E5E2DC] bg-white px-3.5 py-2.5 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
								/>
							</div>
						</div>

						<div className="space-y-2 pt-2">
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
										className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#E5E2DC] bg-[#F9F8F6] py-4 text-xs font-medium text-neutral-700 transition-colors hover:border-black hover:bg-neutral-100"
									>
										<Upload className="size-4 text-neutral-600" />
										<span>Pilih Gambar (Downscale otomatis max 512px)</span>
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

							{imageUrl && (
								<div className="relative mt-2 flex items-center gap-3 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-2">
									<img
										src={imageUrl}
										alt="Pratinjau"
										className="size-14 rounded-md object-cover border border-[#E5E2DC]"
									/>
									<div className="min-w-0 flex-1 text-[11px]">
										<p className="font-bold text-neutral-900">Gambar Terpilih</p>
										<p className="truncate text-neutral-500">Maksimal 512px terkompresi</p>
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

						<div className="flex items-center justify-end gap-3 border-t border-[#E5E2DC] pt-5">
							<Link
								to="/products"
								className="rounded-none border border-[#E5E2DC] bg-white px-5 py-2.5 text-xs font-bold text-neutral-700 uppercase tracking-wider hover:bg-neutral-100"
							>
								Batal
							</Link>
							<button
								type="submit"
								disabled={loading}
								className="inline-flex items-center gap-2 rounded-none bg-[#111111] px-6 py-2.5 text-xs font-bold tracking-wider !text-white text-white uppercase transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg shadow-sm disabled:opacity-50 [&_svg]:!text-white [&_svg]:text-white"
							>
								{loading && <Loader2 className="size-3.5 animate-spin !text-white text-white" />}
								<span className="!text-white text-white">Buat Produk</span>
							</button>
						</div>
					</form>
				</div>
			</div>
		</AdminShell>
	);
}
