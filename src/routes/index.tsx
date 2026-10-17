import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Heart, Package, RotateCcw, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { BRAND, EKRAF_SUBSECTORS } from "@/lib/brand";
import { getProducts } from "@/lib/server/products";

export const Route = createFileRoute("/")({ component: HomePage });

// Curated sample products matching NORD aesthetic if in-memory list has few items
const CURATED_SHOWCASE = [
	{
		id: "nord-1",
		name: "Minimalist Leather Sneaker",
		category: "Fashion & Kriya",
		price: 189,
		imageUrl:
			"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "nord-2",
		name: "Monochrome Low-Top Noir",
		category: "Desain Produk",
		price: 215,
		imageUrl:
			"https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "nord-3",
		name: "Raw Canvas Studio Edition",
		category: "Kriya Tekstil",
		price: 165,
		imageUrl:
			"https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "nord-4",
		name: "Classic Chelsea Stone Boot",
		category: "Fashion Nusantara",
		price: 280,
		imageUrl:
			"https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80",
	},
];

function HomePage() {
	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});

	const dynamicProducts = productsQuery.data ?? [];
	const displayProducts =
		dynamicProducts.length >= 4 ? dynamicProducts.slice(0, 4) : CURATED_SHOWCASE;

	return (
		<main className="bg-[#F9F8F6] text-[#111111] antialiased">
			{/* ==============================================================
			    1. HERO SECTION (Matching NORD Reference: Big Title + Pedestal)
			    ============================================================== */}
			<section className="relative overflow-hidden border-b border-[#E5E2DC] px-6 pt-10 pb-20 sm:pt-16 sm:pb-28">
				<div className="mx-auto max-w-7xl">
					{/* Giant Architectural NORD / EKRAF Header */}
					<div className="relative select-none text-center">
						<h1 className="font-serif text-[18vw] leading-none font-black tracking-[-0.03em] text-[#111111] sm:text-[16vw] lg:text-[170px]">
							NORD
						</h1>
						<p className="mt-2 text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
							{BRAND.name} &bull; CURATED COLLECTION NO. 1
						</p>
					</div>

					{/* Hero Showcase with Stone Pedestal & Flanking Columns */}
					<div className="relative mt-8 grid grid-cols-1 items-center gap-8 lg:mt-12 lg:grid-cols-12">
						{/* Left Column: Design That Endures */}
						<div className="order-2 text-center lg:order-1 lg:col-span-3 lg:text-left">
							<h2 className="font-sans text-xl font-extrabold tracking-[0.1em] text-[#111111] uppercase sm:text-2xl">
								DESIGN
								<br />
								THAT ENDURES
							</h2>
							<p className="mt-3 text-xs leading-relaxed text-neutral-600 sm:text-sm">
								Sentuhan ketukangan kontemporer berpadu material alami pilihan. Kedaulatan kreasi
								dalam bentuk murni.
							</p>
							<div className="mt-6">
								<Link
									to="/products"
									className="inline-block rounded-none bg-[#111111] px-8 py-3.5 text-xs font-bold tracking-[0.18em] text-white uppercase transition-all hover:bg-neutral-800 shadow-sm"
								>
									SHOP NOW
								</Link>
							</div>
						</div>

						{/* Center Column: High-End Hero Product on Brutalist Pedestal */}
						<div className="order-1 flex justify-center lg:order-2 lg:col-span-6">
							<div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#EAE7E0] p-4 shadow-xl">
								<img
									src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85"
									alt="NORD Signature Collection on Pedestal"
									className="h-[360px] w-full object-cover object-center transition-transform duration-700 hover:scale-105 sm:h-[440px]"
								/>
								<div className="absolute top-7 left-7 rounded-none bg-[#111111] px-3 py-1 text-[9px] font-bold tracking-widest text-white uppercase">
									ATELIER EDITION
								</div>
							</div>
						</div>

						{/* Right Column: Collection Metadata */}
						<div className="order-3 text-center lg:order-3 lg:col-span-3 lg:text-right">
							<span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase">
								COLLECTION
							</span>
							<p className="font-serif text-2xl font-bold tracking-wider text-[#111111] uppercase">
								NO. 1
							</p>
							<div className="mt-4 border-t border-[#E5E2DC] pt-4">
								<p className="text-xs font-semibold tracking-widest text-neutral-800 uppercase">
									EST. 2026
								</p>
								<p className="mt-1 text-[11px] text-neutral-500">
									16 Subsektor Terintegrasi &bull; In-Memory Core
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    2. CONTRAST JET BLACK BAND (Matching NORD Reference 3 Columns)
			    ============================================================== */}
			<section className="bg-[#111111] text-white py-16 px-6">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
						{/* Item 1: Sneakers / Kriya */}
						<div className="flex items-center gap-5 border-b border-white/10 pb-8 md:border-b-0 md:pb-0">
							<img
								src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80"
								alt="Sneakers & Kriya Modern"
								className="size-20 shrink-0 rounded-lg object-cover bg-neutral-900 border border-white/10"
							/>
							<div>
								<h3 className="font-sans text-base font-bold tracking-[0.15em] text-white uppercase">
									SNEAKERS
								</h3>
								<p className="mt-1 text-xs text-neutral-400">Refined performance & form.</p>
								<Link
									to="/products"
									className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white underline underline-offset-4 hover:text-neutral-300"
								>
									<span>SHOP SNEAKERS</span>
									<ArrowRight className="size-3" />
								</Link>
							</div>
						</div>

						{/* Item 2: Boots / Fashion */}
						<div className="flex items-center gap-5 border-b border-white/10 pb-8 md:border-b-0 md:pb-0">
							<img
								src="https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=300&q=80"
								alt="Boots & Fashion Kulit"
								className="size-20 shrink-0 rounded-lg object-cover bg-neutral-900 border border-white/10"
							/>
							<div>
								<h3 className="font-sans text-base font-bold tracking-[0.15em] text-white uppercase">
									BOOTS
								</h3>
								<p className="mt-1 text-xs text-neutral-400">Classic utility & craft.</p>
								<Link
									to="/products"
									className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white underline underline-offset-4 hover:text-neutral-300"
								>
									<span>SHOP BOOTS</span>
									<ArrowRight className="size-3" />
								</Link>
							</div>
						</div>

						{/* Item 3: Essentials / Desain */}
						<div className="flex items-center gap-5">
							<img
								src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=300&q=80"
								alt="Essentials & Produk Fungsional"
								className="size-20 shrink-0 rounded-lg object-cover bg-neutral-900 border border-white/10"
							/>
							<div>
								<h3 className="font-sans text-base font-bold tracking-[0.15em] text-white uppercase">
									ESSENTIALS
								</h3>
								<p className="mt-1 text-xs text-neutral-400">Pure form & timeless wear.</p>
								<Link
									to="/products"
									className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white underline underline-offset-4 hover:text-neutral-300"
								>
									<span>SHOP ESSENTIALS</span>
									<ArrowRight className="size-3" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    3. EDITORIAL SPLIT FEATURE: RAW TEXTURES (Matching Reference)
			    ============================================================== */}
			<section className="border-b border-[#E5E2DC] bg-[#EAE7E1] py-16 px-6 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
						{/* Left: Headline & Copy */}
						<div className="lg:col-span-5">
							<span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase">
								NEW SEASON —
							</span>
							<h2 className="mt-2 font-sans text-4xl font-black tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
								RAW
								<br />
								TEXTURES
							</h2>
							<p className="mt-5 text-sm leading-relaxed text-neutral-600 sm:text-base">
								Eksplorasi material mentah, tekstur batu brutalist, dan ketukangan lokal terbaik.
								Karya seni bernilai pakai yang tahan uji waktu.
							</p>
							<div className="mt-8">
								<Link
									to="/products"
									className="inline-block rounded-none bg-[#111111] px-8 py-3.5 text-xs font-bold tracking-[0.18em] text-white uppercase transition-all hover:bg-neutral-800 shadow-sm"
								>
									EXPLORE COLLECTION
								</Link>
							</div>
						</div>

						{/* Right: Concrete Pedestal Photography */}
						<div className="lg:col-span-7">
							<div className="overflow-hidden rounded-2xl bg-neutral-200 shadow-xl">
								<img
									src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85"
									alt="Raw Textures Pedestal"
									className="h-[380px] w-full object-cover object-center transition-transform duration-700 hover:scale-105 sm:h-[460px]"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    4. TRUST PROPOSITIONS BAR (Matching NORD Reference 4 Badges)
			    ============================================================== */}
			<section className="border-b border-[#E5E2DC] bg-[#F2EFE9] py-8 px-6">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
						<div className="flex items-center gap-3">
							<Truck className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									FAST DELIVERY
								</p>
								<p className="text-[11px] text-neutral-500">Quick & safe shipping</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<RotateCcw className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									EASY RETURNS
								</p>
								<p className="text-[11px] text-neutral-500">Within 15 days guarantee</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Sparkles className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									QUALITY ASSURED
								</p>
								<p className="text-[11px] text-neutral-500">Curated master craftsmanship</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<ShieldCheck className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									SECURE PAYMENT
								</p>
								<p className="text-[11px] text-neutral-500">100% verified authentication</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    5. "BEST OF NORD" PRODUCT GRID (Matching NORD Reference)
			    ============================================================== */}
			<section className="py-20 px-6">
				<div className="mx-auto max-w-7xl">
					{/* Section Header */}
					<div className="flex items-baseline justify-between border-b border-[#E5E2DC] pb-4">
						<h2 className="font-serif text-2xl font-bold tracking-[0.1em] text-[#111111] uppercase sm:text-3xl">
							BEST OF NORD
						</h2>
						<Link
							to="/products"
							className="text-xs font-bold tracking-[0.18em] text-[#111111] uppercase underline underline-offset-4 hover:text-neutral-600"
						>
							VIEW ALL
						</Link>
					</div>

					{/* 4 Clean Minimalist Product Cards */}
					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{displayProducts.map((p) => {
							const priceNum = typeof p.price === "number" ? p.price : Number(p.price) || 0;
							return (
								<div
									key={p.id}
									className="group flex flex-col justify-between rounded-xl border border-[#E5E2DC] bg-white p-4 shadow-xs transition-all hover:border-black hover:shadow-md"
								>
									{/* Top Photo & Wishlist Heart */}
									<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#F9F8F6]">
										<button
											type="button"
											aria-label="Simpan ke wishlist"
											className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-xs transition-colors hover:bg-black hover:text-white"
										>
											<Heart className="size-4" />
										</button>
										{p.imageUrl ? (
											<img
												src={p.imageUrl}
												alt={p.name}
												className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
											/>
										) : (
											<div className="flex size-full items-center justify-center text-neutral-400">
												<Package className="size-10" />
											</div>
										)}
									</div>

									{/* Product Details */}
									<div className="mt-4 flex flex-1 flex-col justify-between">
										<div>
											<span className="text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
												{"category" in p ? (p.category as string) : "Koleksi Ekraf"}
											</span>
											<h3 className="mt-1 font-sans text-sm font-bold text-neutral-950 transition-colors group-hover:text-neutral-700">
												{p.name}
											</h3>
										</div>
										<div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
											<span className="font-sans text-sm font-bold text-neutral-950">
												${priceNum.toFixed(2)}
											</span>
											<Link
												to="/products"
												className="text-[11px] font-bold tracking-wider text-neutral-900 uppercase hover:underline"
											>
												Detail &rarr;
											</Link>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ==============================================================
			    6. SUBSECTOR ARCHIVE STRIP (16 Subsektor Ekraf)
			    ============================================================== */}
			<section className="border-t border-[#E5E2DC] bg-[#F2EFE9] py-16 px-6">
				<div className="mx-auto max-w-7xl">
					<div className="text-center">
						<span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase">
							Kedaulatan Ekonomi Kreatif
						</span>
						<h2 className="mt-2 font-serif text-2xl font-bold tracking-[0.1em] text-[#111111] uppercase sm:text-3xl">
							16 SUBSEKTOR ATELIER
						</h2>
					</div>

					<div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
						{EKRAF_SUBSECTORS.map((sub, i) => {
							const Icon = sub.icon;
							return (
								<Link
									key={sub.slug}
									to="/products"
									className="group flex flex-col items-center justify-center rounded-xl border border-[#E5E2DC] bg-white p-4 text-center shadow-2xs transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-sm"
								>
									<Icon className="size-5 text-neutral-700 transition-colors group-hover:text-black" />
									<span className="mt-2 text-[10px] font-bold tracking-wider text-neutral-900 uppercase">
										{sub.name}
									</span>
									<span className="text-[9px] font-mono text-neutral-400">0{i + 1}</span>
								</Link>
							);
						})}
					</div>
				</div>
			</section>
		</main>
	);
}
