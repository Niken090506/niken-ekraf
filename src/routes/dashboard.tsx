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
			subtitle="Pusat kendali ekosistem terkelola dengan validasi server-side dan autentikasi aman."
			actions={
				<div className="flex items-center gap-2">
					<Link
						to="/products/new"
						className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_15px_rgba(45,212,191,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(45,212,191,0.5)] active:scale-[0.98]"
					>
						<Plus className="size-3.5" />
						<span>Tambah Produk</span>
					</Link>
				</div>
			}
		>
			<div className="space-y-6">
				{/* 4 Web3 Glass Metric Cards */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<MetricCard
						title="Total Produk"
						value={products.length}
						sub="Katalog terdaftar aktif"
						icon={Package}
						trend="+100% In-Memory"
						color="teal"
					/>
					<MetricCard
						title="Total Pengguna"
						value={users.length}
						sub="Akun dalam sesi memori"
						icon={Users}
						trend={`${regularUserCount} User`}
						color="cyan"
					/>
					<MetricCard
						title="Administrator"
						value={adminCount}
						sub="Akses kontrol penuh"
						icon={ShieldCheck}
						trend="Root Guard"
						color="emerald"
					/>
					<MetricCard
						title="Database Mode"
						value="Memory"
						sub="Stateless & Ephemeral"
						icon={Database}
						trend="Zero-latency"
						color="purple"
					/>
				</div>

				{/* Quick Actions & Navigation Bento Grid */}
				<div className="grid gap-6 lg:grid-cols-12">
					{/* Recent Products Card */}
					<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-8">
						<div className="flex items-center justify-between pb-4">
							<div className="flex items-center gap-2">
								<Layers className="size-4 text-teal-400" />
								<h2 className="font-serif text-lg font-medium text-white">Produk Terbaru</h2>
							</div>
							<Link
								to="/products"
								className="inline-flex items-center gap-1 text-xs font-medium text-teal-300 hover:text-teal-200"
							>
								<span>Lihat Semua</span>
								<ArrowRight className="size-3.5" />
							</Link>
						</div>

						{products.length === 0 ? (
							<div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-slate-400">
								Belum ada produk di database. Klik tombol "Tambah Produk" atau jalankan Seed di
								halaman Setup.
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs">
									<thead>
										<tr className="border-b border-white/10 text-slate-400">
											<th className="pb-3 font-semibold">Produk</th>
											<th className="pb-3 font-semibold">Harga</th>
											<th className="pb-3 font-semibold">Stok</th>
											<th className="pb-3 text-right font-semibold">Aksi</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-white/5 text-slate-300">
										{products.slice(0, 5).map((p) => (
											<tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
												<td className="py-3 pr-4">
													<div className="flex items-center gap-3">
														{p.imageUrl ? (
															<img
																src={p.imageUrl}
																alt={p.name}
																className="size-8 rounded-lg object-cover"
															/>
														) : (
															<div className="flex size-8 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-300">
																<Package className="size-4" />
															</div>
														)}
														<div>
															<p className="font-medium text-white">{p.name}</p>
															<p className="max-w-xs truncate text-[11px] text-slate-400">
																{p.description}
															</p>
														</div>
													</div>
												</td>
												<td className="py-3 font-mono text-teal-300">
													${Number(p.price).toFixed(2)}
												</td>
												<td className="py-3">
													<span
														className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
															p.stock > 0
																? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
																: "border border-red-500/30 bg-red-500/10 text-red-300"
														}`}
													>
														{p.stock > 0 ? `${p.stock} unit` : "Habis"}
													</span>
												</td>
												<td className="py-3 text-right">
													<Link
														to="/products/$productId"
														params={{ productId: p.id }}
														className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
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
						<div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
							<div className="flex items-center gap-2">
								<Activity className="size-4 text-emerald-400" />
								<h2 className="font-serif text-lg font-medium text-white">Status Sistem</h2>
							</div>

							<div className="mt-4 space-y-3 text-xs">
								<div className="flex items-center justify-between border-b border-white/5 pb-2">
									<span className="text-slate-400">Engine Autentikasi</span>
									<span className="font-semibold text-teal-300">Better Auth v1.5</span>
								</div>
								<div className="flex items-center justify-between border-b border-white/5 pb-2">
									<span className="text-slate-400">Framework</span>
									<span className="font-semibold text-teal-300">TanStack Start (React 19)</span>
								</div>
								<div className="flex items-center justify-between border-b border-white/5 pb-2">
									<span className="text-slate-400">Proteksi Rate Limit</span>
									<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-300">
										Aktif (5 Percobaan)
									</span>
								</div>
								<div className="flex items-center justify-between pb-1">
									<span className="text-slate-400">Aturan Self-Demote</span>
									<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-300">
										Terkunci (Protected)
									</span>
								</div>
							</div>

							<div className="mt-6">
								<Link
									to="/setup"
									className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-white/10 hover:text-white"
								>
									<Sparkles className="size-3.5 text-teal-400" />
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
	color,
}: {
	title: string;
	value: string | number;
	sub: string;
	icon: React.ComponentType<{ className?: string }>;
	trend: string;
	color: "teal" | "cyan" | "emerald" | "purple";
}) {
	const colorClasses = {
		teal: "border-teal-500/20 bg-teal-500/10 text-teal-300",
		cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
		emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
		purple: "border-purple-500/20 bg-purple-500/10 text-purple-300",
	};

	return (
		<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_4px_24px_0_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all hover:border-teal-400/30 hover:shadow-[0_0_25px_rgba(45,212,191,0.12)]">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
					{title}
				</span>
				<div
					className={`flex size-8 items-center justify-center rounded-xl border ${colorClasses[color]}`}
				>
					<Icon className="size-4" />
				</div>
			</div>
			<p className="mt-3 font-serif text-3xl font-light text-white">{value}</p>
			<div className="mt-2 flex items-center justify-between text-xs">
				<span className="text-slate-500">{sub}</span>
				<span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-teal-300">
					{trend}
				</span>
			</div>
		</div>
	);
}
