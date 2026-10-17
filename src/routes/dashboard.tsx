import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import {
	Activity,
	ArrowRight,
	Database,
	Layers,
	Package,
	Plus,
	ShieldCheck,
	Sparkles,
	Users,
} from "lucide-react";

import { AdminShell } from "@/components/AdminShell";
import { getServerSession } from "@/lib/server/auth";
import { getProducts } from "@/lib/server/products";
import { getUsers } from "@/lib/server/users";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
	},
	component: Dashboard,
});

function Dashboard() {
	const productsQuery = useQuery({
		queryKey: ["dashboard", "products"],
		queryFn: async () => getProducts(),
	});
	const usersQuery = useQuery({
		queryKey: ["dashboard", "users"],
		queryFn: async () => getUsers(),
	});

	const products = productsQuery.data ?? [];
	const users = usersQuery.data ?? [];
	const adminCount = users.filter((u) => u.role === "admin").length;
	const regularUserCount = users.filter((u) => u.role === "user").length;

	return (
		<AdminShell
			title="Ikhtisar Dashboard"
			subtitle="Pusat kendali ekosistem katalog & tata kelola pengguna terverifikasi."
			actions={
				<div className="flex items-center gap-2">
					<Link
						to="/products/new"
						className="inline-flex items-center gap-1.5 rounded-none bg-[#111111] px-5 py-2.5 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-neutral-800 shadow-sm"
					>
						<Plus className="size-3.5" />
						<span>Tambah Produk</span>
					</Link>
				</div>
			}
		>
			<div className="space-y-6">
				{/* 4 Clean Minimalist Metric Cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title="Total Produk"
						value={products.length}
						sub="Katalog terdaftar aktif"
						icon={Package}
						trend="Aktif"
					/>
					<MetricCard
						title="Total Pengguna"
						value={users.length}
						sub="Akun dalam memori"
						icon={Users}
						trend={`${regularUserCount} User`}
					/>
					<MetricCard
						title="Administrator"
						value={adminCount}
						sub="Akses kontrol penuh"
						icon={ShieldCheck}
						trend="Root Guard"
					/>
					<MetricCard
						title="Database Mode"
						value="Memory"
						sub="Stateless & Ephemeral"
						icon={Database}
						trend="Zero-latency"
					/>
				</div>

				{/* Quick Actions & Navigation Bento Grid */}
				<div className="grid gap-6 lg:grid-cols-12">
					{/* Recent Products Card */}
					<div className="rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs lg:col-span-8">
						<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
							<div className="flex items-center gap-2">
								<Layers className="size-4 text-neutral-800" />
								<h2 className="font-serif text-base font-bold tracking-wide text-[#111111] uppercase">
									Produk Terbaru
								</h2>
							</div>
							<Link
								to="/products"
								className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-[#111111] uppercase hover:underline"
							>
								<span>Lihat Semua</span>
								<ArrowRight className="size-3.5" />
							</Link>
						</div>

						{products.length === 0 ? (
							<div className="rounded-lg border border-dashed border-[#E5E2DC] bg-[#F9F8F6] p-8 text-center text-sm text-neutral-500">
								Belum ada produk di database. Klik tombol "Tambah Produk" atau jalankan Seed di
								halaman Setup.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs">
									<thead>
										<tr className="border-b border-[#E5E2DC] text-neutral-500">
											<th className="py-3 font-bold uppercase tracking-wider text-[10px]">
												Produk
											</th>
											<th className="py-3 font-bold uppercase tracking-wider text-[10px]">Harga</th>
											<th className="py-3 font-bold uppercase tracking-wider text-[10px]">Stok</th>
											<th className="py-3 text-right font-bold uppercase tracking-wider text-[10px]">
												Aksi
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-[#E5E2DC] text-neutral-800">
										{products.slice(0, 5).map((p) => (
											<tr key={p.id} className="transition-colors hover:bg-[#F9F8F6]">
												<td className="py-3 pr-4">
													<div className="flex items-center gap-3">
														{p.imageUrl ? (
															<img
																src={p.imageUrl}
																alt={p.name}
																className="size-9 rounded-lg border border-[#E5E2DC] object-cover"
															/>
														) : (
															<div className="flex size-9 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-500">
																<Package className="size-4" />
															</div>
														)}
														<div>
															<p className="font-bold text-neutral-950">{p.name}</p>
															<p className="max-w-xs truncate text-[11px] text-neutral-500">
																{p.description}
															</p>
														</div>
													</div>
												</td>
												<td className="py-3 font-bold text-neutral-950">
													${Number(p.price).toFixed(2)}
												</td>
												<td className="py-3">
													<span
														className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
															p.stock > 0
																? "border border-neutral-200 bg-neutral-100 text-neutral-800"
																: "border border-red-200 bg-red-50 text-red-700"
														}`}
													>
														{p.stock > 0 ? `${p.stock} unit` : "Habis"}
													</span>
												</td>
												<td className="py-3 text-right">
													<Link
														to="/products/$productId"
														params={{ productId: p.id }}
														className="rounded-md border border-[#E5E2DC] bg-white px-3 py-1 text-[11px] font-bold text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-black"
													>
														Edit
													</Link>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* System Status / Quick Info */}
					<div className="space-y-4 lg:col-span-4">
						<div className="rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs">
							<div className="flex items-center gap-2 border-b border-[#E5E2DC] pb-4">
								<Activity className="size-4 text-neutral-800" />
								<h2 className="font-serif text-base font-bold tracking-wide text-[#111111] uppercase">
									Status Sistem
								</h2>
							</div>

							<div className="mt-4 space-y-3 text-xs">
								<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-2">
									<span className="text-neutral-500">Engine Autentikasi</span>
									<span className="font-bold text-neutral-900">Better Auth v1.5</span>
								</div>
								<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-2">
									<span className="text-neutral-500">Framework</span>
									<span className="font-bold text-neutral-900">TanStack Start (React 19)</span>
								</div>
								<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-2">
									<span className="text-neutral-500">Proteksi Rate Limit</span>
									<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-bold text-[10px] text-neutral-800">
										Aktif (5x Limit)
									</span>
								</div>
								<div className="flex items-center justify-between pb-1">
									<span className="text-neutral-500">Aturan Self-Demote</span>
									<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 font-bold text-[10px] text-neutral-800">
										Terkunci (Protected)
									</span>
								</div>
							</div>

							<div className="mt-6 border-t border-[#E5E2DC] pt-4">
								<Link
									to="/setup"
									className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] py-2.5 text-xs font-bold text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-black"
								>
									<Sparkles className="size-3.5" />
									<span>Cek Halaman Setup & Seed</span>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminShell>
	);
}

function MetricCard({
	title,
	value,
	sub,
	icon: Icon,
	trend,
}: {
	title: string;
	value: string | number;
	sub: string;
	icon: React.ComponentType<{ className?: string }>;
	trend: string;
}) {
	return (
		<div className="rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs transition-all hover:border-black hover:shadow-sm">
			<div className="flex items-center justify-between">
				<span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
					{title}
				</span>
				<div className="flex size-8 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-800">
					<Icon className="size-4" />
				</div>
			</div>
			<p className="mt-3 font-sans text-3xl font-black text-[#111111]">{value}</p>
			<div className="mt-2 flex items-center justify-between text-xs">
				<span className="text-[11px] text-neutral-500">{sub}</span>
				<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
					{trend}
				</span>
			</div>
		</div>
	);
}
