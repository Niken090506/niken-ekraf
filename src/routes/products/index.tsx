import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	createColumnHelper,
	flexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, Grid, List, Package, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/AdminShell";
import { ProductFormModal } from "@/components/ProductFormModal";
import type { Product } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteProduct, getProducts } from "@/lib/server/products";

export const Route = createFileRoute("/products/")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	component: ProductsPage,
});

function ProductsPage() {
	const queryClient = useQueryClient();
	const deleteFn = useServerFn(deleteProduct);

	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});

	const rawData = productsQuery.data ?? [];

	// Client-side search filter
	const filteredData = useMemo(() => {
		if (!searchTerm.trim()) return rawData;
		const lower = searchTerm.toLowerCase();
		return rawData.filter(
			(p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower),
		);
	}, [rawData, searchTerm]);

	const features = tableFeatures({ rowSortingFeature });
	const columnHelper = createColumnHelper<typeof features, Product>();

	const columns = useMemo(
		() =>
			columnHelper.columns([
				columnHelper.display({
					id: "image",
					header: "Foto",
					cell: (info) => {
						const p = info.row.original as Product;
						return p.imageUrl ? (
							<img
								src={p.imageUrl}
								alt={p.name}
								className="size-11 rounded-lg border border-[#E5E2DC] object-cover"
							/>
						) : (
							<div className="flex size-11 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-400">
								<Package className="size-5" />
							</div>
						);
					},
				}),
				columnHelper.accessor("name", {
					header: "Nama Produk",
					cell: (info) => {
						const p = info.row.original as Product;
						return (
							<div>
								<span className="font-bold text-neutral-950">{p.name}</span>
								<p className="max-w-xs truncate text-[11px] text-neutral-500">{p.description}</p>
							</div>
						);
					},
				}),
				columnHelper.accessor("price", {
					header: "Harga",
					cell: (info) => (
						<span className="font-sans text-xs font-bold text-neutral-950">
							${Number(info.getValue()).toFixed(2)}
						</span>
					),
				}),
				columnHelper.accessor("stock", {
					header: "Stok",
					cell: (info) => {
						const stock = Number(info.getValue());
						return (
							<span
								className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
									stock > 0
										? "border border-neutral-200 bg-neutral-100 text-neutral-800"
										: "border border-red-200 bg-red-50 text-red-700"
								}`}
							>
								{stock > 0 ? `${stock} unit` : "Habis"}
							</span>
						);
					},
				}),
				columnHelper.display({
					id: "actions",
					header: "Aksi",
					cell: (info) => {
						const product = info.row.original as Product;
						return (
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => {
										setEditingProduct(product);
										setModalOpen(true);
									}}
									className="flex size-7 items-center justify-center rounded-md border border-[#E5E2DC] bg-white text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
									title="Edit via Modal"
								>
									<Edit className="size-3.5" />
								</button>
								<Link
									to="/products/$productId"
									params={{ productId: product.id }}
									className="flex size-7 items-center justify-center rounded-md border border-[#E5E2DC] bg-white text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
									title="Halaman Detail"
								>
									<span className="text-[10px] font-bold">Detil</span>
								</Link>
								<button
									type="button"
									onClick={() => {
										setDeleteId(product.id);
										setDeleteError("");
									}}
									className="flex size-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100"
									title="Hapus Produk"
								>
									<Trash2 className="size-3.5" />
								</button>
							</div>
						);
					},
				}),
			]),
		[columnHelper],
	);

	const table = useTable({
		features,
		columns,
		data: filteredData,
	});

	const confirmDelete = async () => {
		if (!deleteId) return;
		setDeleteLoading(true);
		setDeleteError("");

		try {
			await deleteFn({ data: { id: deleteId } });
			await queryClient.invalidateQueries({ queryKey: ["products"] });
			await queryClient.invalidateQueries({ queryKey: ["dashboard", "products"] });
			setDeleteId(null);
		} catch (err) {
			setDeleteError(err instanceof Error ? err.message : "Gagal menghapus produk");
		} finally {
			setDeleteLoading(false);
		}
	};

	return (
		<AdminShell
			title="Katalog Produk"
			subtitle="Kurasi & manajemen katalog produk ekonomi kreatif bergaya e-commerce high-end."
			actions={
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => {
							setEditingProduct(null);
							setModalOpen(true);
						}}
						className="inline-flex items-center gap-1.5 rounded-none bg-[#111111] px-5 py-2.5 text-xs font-bold tracking-wider !text-white text-white uppercase transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg shadow-sm [&_svg]:!text-white [&_svg]:text-white"
					>
						<Plus className="size-3.5 !text-white text-white" />
						<span className="!text-white text-white">Tambah Produk</span>
					</button>
				</div>
			}
		>
			<div className="space-y-6">
				{/* Search & Layout View Toggle Bar */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative w-full max-w-sm">
						<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Cari nama atau deskripsi produk..."
							className="w-full rounded-lg border border-[#E5E2DC] bg-white py-2 pr-4 pl-9 text-xs font-medium text-neutral-900 placeholder-neutral-400 focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
						/>
					</div>

					<div className="flex items-center gap-3">
						<div className="text-xs text-neutral-500">
							Menampilkan <span className="font-bold text-neutral-950">{filteredData.length}</span>{" "}
							dari {rawData.length} produk
						</div>

						{/* View Mode Toggle */}
						<div className="flex items-center rounded-lg border border-[#E5E2DC] bg-white p-0.5">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase transition-colors ${
									viewMode === "grid"
										? "bg-[#111111] !text-white text-white [&_svg]:!text-white [&_svg]:text-white"
										: "text-neutral-600 hover:text-black"
								}`}
								title="Tampilan Grid E-Commerce"
							>
								<Grid className="size-3.5" />
								<span className={viewMode === "grid" ? "!text-white text-white" : ""}>Grid</span>
							</button>
							<button
								type="button"
								onClick={() => setViewMode("table")}
								className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase transition-colors ${
									viewMode === "table"
										? "bg-[#111111] !text-white text-white [&_svg]:!text-white [&_svg]:text-white"
										: "text-neutral-600 hover:text-black"
								}`}
								title="Tampilan Tabel"
							>
								<List className="size-3.5" />
								<span className={viewMode === "table" ? "!text-white text-white" : ""}>Tabel</span>
							</button>
						</div>
					</div>
				</div>

				{/* 1. E-Commerce Grid View (Matching NORD Reference) */}
				{viewMode === "grid" && (
					<div>
						{filteredData.length === 0 ? (
							<div className="rounded-xl border border-dashed border-[#E5E2DC] bg-white p-12 text-center text-sm text-neutral-500">
								{productsQuery.isPending
									? "Memuat katalog produk..."
									: "Tidak ada produk yang sesuai dengan pencarian."}
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{filteredData.map((product) => (
									<div
										key={product.id}
										className="group flex flex-col justify-between rounded-xl border border-[#E5E2DC] bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-black hover:shadow-xl"
									>
										{/* Product Image */}
										<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#F9F8F6]">
											{product.imageUrl ? (
												<img
													src={product.imageUrl}
													alt={product.name}
													className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
												/>
											) : (
												<div className="flex size-full items-center justify-center text-neutral-400">
													<Package className="size-10" />
												</div>
											)}
											<span
												className={`absolute top-2.5 left-2.5 rounded-none px-2 py-0.5 text-[9px] font-bold uppercase ${
													product.stock > 0
														? "bg-white text-neutral-900 border border-neutral-200"
														: "bg-red-600 text-white"
												}`}
											>
												{product.stock > 0 ? `Stok: ${product.stock}` : "Habis"}
											</span>
										</div>

										{/* Information */}
										<div className="mt-4 flex flex-1 flex-col justify-between">
											<div>
												<h3 className="font-sans text-sm font-bold text-neutral-950 transition-colors group-hover:text-neutral-700">
													{product.name}
												</h3>
												<p className="mt-1 line-clamp-2 text-xs text-neutral-500">
													{product.description}
												</p>
											</div>

											<div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
												<span className="font-sans text-base font-black text-neutral-950">
													${Number(product.price).toFixed(2)}
												</span>

												{/* Action Buttons */}
												<div className="flex items-center gap-1.5">
													<button
														type="button"
														onClick={() => {
															setEditingProduct(product);
															setModalOpen(true);
														}}
														className="rounded-md border border-[#E5E2DC] bg-white p-1.5 text-neutral-700 transition-all duration-200 hover:bg-neutral-100 hover:text-black hover:scale-110"
														title="Edit Produk"
													>
														<Edit className="size-3.5" />
													</button>
													<Link
														to="/products/$productId"
														params={{ productId: product.id }}
														className="rounded-md border border-[#E5E2DC] bg-white px-2.5 py-1 text-[11px] font-bold text-neutral-800 transition-all duration-200 hover:bg-neutral-100 hover:scale-105"
														title="Detail Produk"
													>
														Detil
													</Link>
													<button
														type="button"
														onClick={() => {
															setDeleteId(product.id);
															setDeleteError("");
														}}
														className="rounded-md border border-red-200 bg-red-50 p-1.5 text-red-600 transition-all duration-200 hover:bg-red-100 hover:scale-110"
														title="Hapus Produk"
													>
														<Trash2 className="size-3.5" />
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* 2. TanStack Table View */}
				{viewMode === "table" && (
					<div className="overflow-hidden rounded-xl border border-[#E5E2DC] bg-white shadow-xs">
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead>
									{table.getHeaderGroups().map((headerGroup) => (
										<tr key={headerGroup.id} className="border-b border-[#E5E2DC] bg-[#F9F8F6]">
											{headerGroup.headers.map((header) => (
												<th
													key={header.id}
													colSpan={header.colSpan}
													className="px-5 py-3.5 text-xs font-bold tracking-wider text-neutral-600 uppercase"
												>
													{header.isPlaceholder ? null : (
														<div
															{...{
																className:
																	"flex items-center gap-1.5 cursor-pointer select-none hover:text-black",
																onClick: header.column.getToggleSortingHandler(),
															}}
														>
															{flexRender(header.column.columnDef.header, header.getContext())}
															<ArrowUpDown className="size-3 opacity-60" />
															{{
																asc: " ▲",
																desc: " ▼",
															}[header.column.getIsSorted() as string] ?? null}
														</div>
													)}
												</th>
											))}
										</tr>
									))}
								</thead>
								<tbody className="divide-y divide-[#E5E2DC] text-neutral-800">
									{table.getRowModel().rows.map((row) => (
										<tr
											key={row.id}
											className="transition-colors duration-200 hover:bg-neutral-50/90"
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
											<td
												colSpan={columns.length}
												className="px-5 py-12 text-center text-neutral-500"
											>
												{productsQuery.isPending
													? "Memuat data produk..."
													: "Tidak ada produk yang sesuai dengan pencarian."}
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Create / Edit Product Modal */}
				<ProductFormModal
					isOpen={modalOpen}
					onClose={() => setModalOpen(false)}
					product={editingProduct}
				/>

				{/* Delete Confirmation Modal */}
				{deleteId && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div
							className="fixed inset-0 bg-black/50 backdrop-blur-xs"
							onClick={() => setDeleteId(null)}
							onKeyDown={(e) => {
								if (e.key === "Escape") setDeleteId(null);
							}}
							role="presentation"
						/>
						<div className="relative w-full max-w-sm rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xl">
							<h3 className="font-serif text-lg font-bold text-neutral-950 uppercase">
								Hapus Produk Ini?
							</h3>
							<p className="mt-2 text-xs leading-relaxed text-neutral-600">
								Tindakan ini tidak dapat dibatalkan. Produk akan dihapus dari katalog memori server.
							</p>
							{deleteError && (
								<p className="mt-3 text-xs text-red-600 leading-relaxed font-semibold">
									{deleteError}
								</p>
							)}
							<div className="mt-6 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => setDeleteId(null)}
									className="rounded-md border border-[#E5E2DC] bg-white px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={confirmDelete}
									disabled={deleteLoading}
									className="rounded-md bg-red-600 px-4 py-2 text-xs font-bold !text-white hover:bg-red-700 disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5"
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
