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
import { ArrowUpDown, Edit, Package, Plus, Search, Trash2 } from "lucide-react";
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
								className="size-10 rounded-xl object-cover border border-white/10"
							/>
						) : (
							<div className="flex size-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-300">
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
								<span className="font-semibold text-white">{p.name}</span>
								<p className="max-w-xs truncate text-[11px] text-slate-400">{p.description}</p>
							</div>
						);
					},
				}),
				columnHelper.accessor("price", {
					header: "Harga",
					cell: (info) => (
						<span className="font-mono text-xs font-semibold text-teal-300">
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
								className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
									stock > 0
										? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
										: "border border-red-500/30 bg-red-500/10 text-red-300"
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
									className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
									title="Edit via Modal"
								>
									<Edit className="size-3.5" />
								</button>
								<Link
									to="/products/$productId"
									params={{ productId: product.id }}
									className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
									title="Halaman Detail"
								>
									<span className="text-[10px] font-semibold">Detil</span>
								</Link>
								<button
									type="button"
									onClick={() => {
										setDeleteId(product.id);
										setDeleteError("");
									}}
									className="flex size-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20"
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
			subtitle="Manajemen produk ekonomi kreatif dengan validasi server-side dan kontrol hak akses admin."
			actions={
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => {
							setEditingProduct(null);
							setModalOpen(true);
						}}
						className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_15px_rgba(45,212,191,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] active:scale-[0.98]"
					>
						<Plus className="size-3.5" />
						<span>Tambah Produk</span>
					</button>
				</div>
			}
		>
			<div className="space-y-6">
				{/* Search & Filter Toolbar */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="relative w-full max-w-sm">
						<Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Cari nama atau deskripsi..."
							className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2 pr-4 pl-9 text-xs text-white placeholder-slate-500 focus:border-teal-400/50 focus:bg-white/[0.06] focus:outline-none"
						/>
					</div>
					<div className="text-xs text-slate-400">
						Menampilkan <span className="font-semibold text-teal-300">{filteredData.length}</span>{" "}
						dari {rawData.length} produk
					</div>
				</div>

				{/* Web3 Glass Table Container */}
				<div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id} className="border-b border-white/10 bg-white/[0.02]">
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												colSpan={header.colSpan}
												className="px-5 py-3.5 text-xs font-semibold tracking-wider text-slate-400 uppercase"
											>
												{header.isPlaceholder ? null : (
													<div
														{...{
															className:
																"flex items-center gap-1.5 cursor-pointer select-none hover:text-white",
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
							<tbody className="divide-y divide-white/5 text-slate-300">
								{table.getRowModel().rows.map((row) => (
									<tr
										key={row.id}
										className="transition-colors hover:bg-white/[0.02] hover:text-white"
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
										<td colSpan={columns.length} className="px-5 py-12 text-center text-slate-400">
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
							className="fixed inset-0 bg-black/70 backdrop-blur-sm"
							onClick={() => setDeleteId(null)}
							onKeyDown={(e) => {
								if (e.key === "Escape") setDeleteId(null);
							}}
							role="presentation"
						/>
						<div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#07171d] p-6 shadow-2xl backdrop-blur-xl">
							<h3 className="font-serif text-lg font-medium text-white">Hapus Produk Ini?</h3>
							<p className="mt-2 text-xs leading-relaxed text-slate-400">
								Tindakan ini tidak dapat dibatalkan. Produk akan dihapus dari katalog memori server.
							</p>
							{deleteError && (
								<p className="mt-3 text-xs text-red-400 leading-relaxed">{deleteError}</p>
							)}
							<div className="mt-6 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => setDeleteId(null)}
									className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5"
								>
									Batal
								</button>
								<button
									type="button"
									onClick={confirmDelete}
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
		</AdminShell>
	);
}
