import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	Check,
	Code2,
	Cpu,
	Heart,
	Layers,
	Package,
	Palette,
	ShieldCheck,
	ShoppingBag,
	Sparkles,
} from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { BRAND, EKRAF_SUBSECTORS } from "@/lib/brand";
import { getProducts } from "@/lib/server/products";
import { useCart, useWishlist } from "@/lib/store";

export const Route = createFileRoute("/")({ component: HomePage });

// Curated sample products representing genuine Indonesian Creative Economy subsectors
const CURATED_SHOWCASE = [
	{
		id: "ekraf-1",
		name: "FoodLoop GIS Engine",
		category: "Aplikasi & Game",
		price: 185,
		imageUrl:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "ekraf-2",
		name: "UlosVerse AI Generative Suite",
		category: "Desain Komunikasi Visual",
		price: 240,
		imageUrl:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "ekraf-3",
		name: "Tenun Ikat Sumba Timur Heritage",
		category: "Kriya Tekstil Nusantara",
		price: 320,
		imageUrl:
			"https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
	},
	{
		id: "ekraf-4",
		name: "Saga Nusantara 3D Asset Pack",
		category: "Animasi & Media Baru",
		price: 195,
		imageUrl:
			"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
	},
];

function HomePage() {
	const { data: session } = authClient.useSession();
	const { toggle: toggleWishlist, isWishlisted } = useWishlist();
	const { addItem } = useCart();
	const [addedId, setAddedId] = useState<string | null>(null);

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});

	const dynamicProducts = productsQuery.data ?? [];
	const displayProducts =
		dynamicProducts.length >= 4 ? dynamicProducts.slice(0, 4) : CURATED_SHOWCASE;

	const handleAddToCart = (product: {
		id: string;
		name: string;
		price: number;
		imageUrl?: string | null;
	}) => {
		addItem(product);
		setAddedId(product.id);
		setTimeout(() => setAddedId(null), 1800);
	};

	return (
		<main className="bg-[#F9F8F6] text-[#111111] antialiased">
			{/* ==============================================================
			    1. HERO SECTION (High-End Gallery Pedestal + Architectural Typography)
			    ============================================================== */}
			<section className="relative overflow-hidden border-b border-[#E5E2DC] px-6 pt-10 pb-20 sm:pt-16 sm:pb-28">
				<div className="mx-auto max-w-7xl">
					{/* Giant Architectural NORD / EKRAF Header */}
					<div className="relative select-none text-center">
						<h1 className="font-serif text-[18vw] leading-none font-black tracking-[-0.03em] text-[#111111] sm:text-[16vw] lg:text-[170px]">
							NORD
						</h1>
						<p className="mt-2 text-[10px] font-bold tracking-[0.4em] text-neutral-500 uppercase">
							{BRAND.name} &bull; ATELIER KURASI NASIONAL NO. 1
						</p>
					</div>

					{/* Hero Showcase with Stone Pedestal & Flanking Columns */}
					<div className="relative mt-8 grid grid-cols-1 items-center gap-8 lg:mt-12 lg:grid-cols-12">
						{/* Left Column: Kedaulatan Karya Kreatif */}
						<div className="order-2 text-center lg:order-1 lg:col-span-4 lg:text-left">
							<h2 className="font-sans text-xl font-extrabold tracking-[0.1em] text-[#111111] uppercase sm:text-2xl">
								KEDAULATAN
								<br />
								KARYA KREATIF
							</h2>
							<p className="mt-3 text-xs leading-relaxed text-neutral-600 sm:text-sm">
								Sentuhan ketukangan kriya luhur berpadu kecerdasan komputasi modern. Platform kurasi
								dan tata kelola 16 subsektor ekonomi kreatif dengan performa in-memory berkecepatan
								tinggi.
							</p>

							{/* Public Action Buttons: Dual CTAs */}
							<div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
								<Link
									to="/products"
									className="group inline-flex items-center gap-2 rounded-none bg-[#111111] px-6 py-3.5 text-xs font-bold tracking-[0.18em] !text-white text-white uppercase transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg shadow-sm [&_svg]:!text-white [&_svg]:text-white"
								>
									<span className="!text-white text-white">JELAJAHI KATALOG</span>
									<ArrowRight className="size-3.5 !text-white text-white transition-transform duration-300 group-hover:translate-x-1" />
								</Link>
								<Link
									to={session?.user ? "/dashboard" : "/login"}
									className="group inline-flex items-center gap-2 rounded-none bg-[#111111] border-2 border-[#111111] px-6 py-3.5 text-xs font-bold tracking-[0.18em] !text-white text-white uppercase hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 shadow-sm [&_svg]:!text-white [&_svg]:text-white"
								>
									<span className="!text-white text-white">
										{session?.user ? "DASHBOARD ADMIN" : "MASUK KE PANEL"}
									</span>
									<ArrowRight className="size-3.5 !text-white text-white transition-transform duration-300 group-hover:translate-x-1" />
								</Link>
							</div>
						</div>

						{/* Center Column: High-End Heritage Artisan Craft on Brutalist Pedestal */}
						<div className="order-1 flex justify-center lg:order-2 lg:col-span-5">
							<div className="group relative w-full max-w-md overflow-hidden rounded-2xl bg-[#EAE7E0] p-4 shadow-xl transition-all duration-500 hover:shadow-2xl">
								<img
									src="https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=1200&q=85"
									alt="Tenun Ikat Sumba Timur Heritage on Pedestal"
									className="h-[360px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 sm:h-[440px]"
								/>
								<div className="absolute top-7 left-7 rounded-none bg-[#111111] px-3 py-1 text-[9px] font-bold tracking-widest !text-white uppercase shadow-xs">
									KURASI ADILUHUNG
								</div>
							</div>
						</div>

						{/* Right Column: Collection Metadata */}
						<div className="order-3 text-center lg:order-3 lg:col-span-3 lg:text-right">
							<span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase">
								KURASI NASIONAL
							</span>
							<p className="font-serif text-2xl font-bold tracking-wider text-[#111111] uppercase">
								EDISI I
							</p>
							<div className="mt-4 border-t border-[#E5E2DC] pt-4">
								<p className="text-xs font-semibold tracking-widest text-neutral-800 uppercase">
									EST. 2026
								</p>
								<p className="mt-1 text-[11px] text-neutral-500">
									16 Subsektor Terpadu &bull; In-Memory Core
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    2. CONTRAST JET BLACK BAND (3 Pillars of Indonesian Ekraf)
			    ============================================================== */}
			<section className="bg-[#111111] text-white py-16 px-6">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
						{/* Pillar 1: Kriya & Fashion */}
						<div className="group flex items-center gap-5 border-b border-white/10 pb-8 md:border-b-0 md:pb-0">
							<div className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900 size-20 shrink-0">
								<img
									src="https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=300&q=80"
									alt="Kriya & Fashion Nusantara"
									className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
							</div>
							<div>
								<div className="flex items-center gap-2">
									<Palette className="size-4 text-neutral-400" />
									<h3 className="font-sans text-base font-bold tracking-[0.15em] text-white uppercase">
										KRIYA & FASHION
									</h3>
								</div>
								<p className="mt-1 text-xs text-neutral-400">
									Wastra tenun, kulit alami, & kriya nusantara.
								</p>
								<Link
									to="/products"
									className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider !text-white text-white underline underline-offset-4 hover:text-neutral-300 transition-colors [&_svg]:!text-white [&_svg]:text-white"
								>
									<span className="!text-white text-white">JELAJAHI KRIYA</span>
									<ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1 !text-white text-white" />
								</Link>
							</div>
						</div>

						{/* Pillar 2: Aplikasi & Game */}
						<div className="group flex items-center gap-5 border-b border-white/10 pb-8 md:border-b-0 md:pb-0">
							<div className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900 size-20 shrink-0">
								<img
									src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80"
									alt="Aplikasi & Game Dev"
									className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
							</div>
							<div>
								<div className="flex items-center gap-2">
									<Code2 className="size-4 text-neutral-400" />
									<h3 className="font-sans text-base font-bold tracking-[0.15em] text-white uppercase">
										APLIKASI & GAME
									</h3>
								</div>
								<p className="mt-1 text-xs text-neutral-400">
									Engine GIS, platform kuliner, & game indie.
								</p>
								<Link
									to="/products"
									className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider !text-white text-white underline underline-offset-4 hover:text-neutral-300 transition-colors [&_svg]:!text-white [&_svg]:text-white"
								>
									<span className="!text-white text-white">JELAJAHI APLIKASI</span>
									<ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1 !text-white text-white" />
								</Link>
							</div>
						</div>

						{/* Pillar 3: Desain & Animasi */}
						<div className="group flex items-center gap-5">
							<div className="overflow-hidden rounded-lg border border-white/10 bg-neutral-900 size-20 shrink-0">
								<img
									src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80"
									alt="Desain & Animasi 3D"
									className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
							</div>
							<div>
								<div className="flex items-center gap-2">
									<Layers className="size-4 text-neutral-400" />
									<h3 className="font-sans text-base font-bold tracking-[0.15em] text-white uppercase">
										DESAIN & ANIMASI
									</h3>
								</div>
								<p className="mt-1 text-xs text-neutral-400">
									Generative AI, aset 3D rigging, & DKV.
								</p>
								<Link
									to="/products"
									className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider !text-white text-white underline underline-offset-4 hover:text-neutral-300 transition-colors [&_svg]:!text-white [&_svg]:text-white"
								>
									<span className="!text-white text-white">JELAJAHI DESAIN</span>
									<ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-1 !text-white text-white" />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    3. EDITORIAL SPLIT FEATURE: WARISAN BUDAYA & INOVASI DIGITAL
			    ============================================================== */}
			<section className="border-b border-[#E5E2DC] bg-[#EAE7E1] py-16 px-6 lg:py-24">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
						{/* Left: Headline & Copy */}
						<div className="lg:col-span-5">
							<span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase">
								INOVASI TERPADU —
							</span>
							<h2 className="mt-2 font-sans text-3xl font-black tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">
								WARISAN BUDAYA
								<br />
								INOVASI DIGITAL
							</h2>
							<p className="mt-5 text-sm leading-relaxed text-neutral-600 sm:text-base">
								Konvergensi antara ketukangan kriya adiluhung Nusantara dan keunggulan teknologi
								digital generasi baru. Menghadirkan produk ekonomi kreatif yang memiliki nilai
								estetika luhur sekaligus berdaya saing global.
							</p>
							<div className="mt-8">
								<Link
									to="/products"
									className="group inline-flex items-center gap-2 rounded-none bg-[#111111] px-8 py-3.5 text-xs font-bold tracking-[0.18em] !text-white text-white uppercase transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg shadow-sm [&_svg]:!text-white [&_svg]:text-white"
								>
									<span className="!text-white text-white">JELAJAHI KOLEKSI EKRAF</span>
									<ArrowRight className="size-3.5 !text-white text-white transition-transform duration-300 group-hover:translate-x-1" />
								</Link>
							</div>
						</div>

						{/* Right: Studio Creative Photography */}
						<div className="lg:col-span-7">
							<div className="group overflow-hidden rounded-2xl bg-neutral-200 shadow-xl transition-all duration-500 hover:shadow-2xl">
								<img
									src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85"
									alt="Kurasi Desain Interior & Kriya Kontemporer Nusantara"
									className="h-[380px] w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 sm:h-[460px]"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    4. TRUST PROPOSITIONS BAR (4 Core Guarantees)
			    ============================================================== */}
			<section className="border-b border-[#E5E2DC] bg-[#F2EFE9] py-8 px-6">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
						<div className="flex items-center gap-3">
							<Sparkles className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									KURASI TERVERIFIKASI
								</p>
								<p className="text-[11px] text-neutral-500">Standar 16 subsektor resmi</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<ShieldCheck className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									ORISINALITAS TERJAGA
								</p>
								<p className="text-[11px] text-neutral-500">Perlindungan hak cipta karya</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Cpu className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									ARSITEKTUR IN-MEMORY
								</p>
								<p className="text-[11px] text-neutral-500">Akses instan tanpa latensi</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Check className="size-6 shrink-0 text-neutral-800" />
							<div>
								<p className="text-xs font-bold tracking-wider text-[#111111] uppercase">
									KEDAULATAN DATA
								</p>
								<p className="text-[11px] text-neutral-500">Keamanan otentikasi Better Auth</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    5. "KURASI UNGGULAN EKRAF" PRODUCT GRID (With Interactive Wishlist & Cart)
			    ============================================================== */}
			<section className="py-20 px-6">
				<div className="mx-auto max-w-7xl">
					{/* Section Header */}
					<div className="flex items-baseline justify-between border-b border-[#E5E2DC] pb-4">
						<div>
							<span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase">
								ETALASE UNGGULAN
							</span>
							<h2 className="mt-1 font-serif text-2xl font-bold tracking-[0.1em] text-[#111111] uppercase sm:text-3xl">
								KURASI UNGGULAN EKRAF
							</h2>
						</div>
						<Link
							to="/products"
							className="group inline-flex items-center gap-1 text-xs font-bold tracking-[0.18em] text-[#111111] uppercase underline underline-offset-4 hover:text-neutral-600 transition-colors"
						>
							<span>SEMUA PRODUK</span>
							<ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
						</Link>
					</div>

					{/* 4 Clean Minimalist Product Cards with Hover Lift */}
					<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{displayProducts.map((p) => {
							const priceNum = typeof p.price === "number" ? p.price : Number(p.price) || 0;
							const wishlisted = isWishlisted(p.id);
							const isJustAdded = addedId === p.id;

							return (
								<div
									key={p.id}
									className="group flex flex-col justify-between rounded-xl border border-[#E5E2DC] bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-black hover:shadow-xl"
								>
									{/* Top Photo & Wishlist Heart Button */}
									<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#F9F8F6]">
										<button
											type="button"
											onClick={() =>
												toggleWishlist({
													id: p.id,
													name: p.name,
													price: priceNum,
													imageUrl: p.imageUrl,
												})
											}
											aria-label="Simpan ke wishlist"
											className={`absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full shadow-xs transition-all duration-200 hover:scale-110 ${
												wishlisted
													? "bg-red-600 text-white"
													: "bg-white/90 text-neutral-600 hover:bg-black hover:text-white"
											}`}
											title={wishlisted ? "Hapus dari Wishlist" : "Simpan ke Wishlist"}
										>
											<Heart className={`size-4 ${wishlisted ? "fill-white text-white" : ""}`} />
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

										<div className="mt-4 space-y-3 border-t border-neutral-100 pt-3">
											<div className="flex items-center justify-between">
												<span className="font-sans text-sm font-bold text-neutral-950">
													${priceNum.toFixed(2)}
												</span>
												<Link
													to="/products"
													className="text-[11px] font-bold tracking-wider text-neutral-700 uppercase hover:text-black hover:underline transition-colors"
												>
													Detail &rarr;
												</Link>
											</div>

											{/* Interactive Add to Cart Button */}
											<button
												type="button"
												onClick={() =>
													handleAddToCart({
														id: p.id,
														name: p.name,
														price: priceNum,
														imageUrl: p.imageUrl,
													})
												}
												className={`flex w-full items-center justify-center gap-1.5 rounded-none py-2 text-[11px] font-bold tracking-wider uppercase transition-all duration-200 hover:-translate-y-0.5 shadow-xs ${
													isJustAdded
														? "bg-emerald-700 !text-white text-white [&_svg]:!text-white [&_svg]:text-white"
														: "bg-[#111111] !text-white text-white hover:bg-neutral-800 [&_svg]:!text-white [&_svg]:text-white"
												}`}
											>
												{isJustAdded ? (
													<>
														<Check className="size-3.5 !text-white text-white" />
														<span className="!text-white text-white">Tersimpan di Keranjang</span>
													</>
												) : (
													<>
														<ShoppingBag className="size-3.5 !text-white text-white" />
														<span className="!text-white text-white">Tambah Keranjang</span>
													</>
												)}
											</button>
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
									className="group flex flex-col items-center justify-center rounded-xl border border-[#E5E2DC] bg-white p-4 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-black hover:shadow-md"
								>
									<Icon className="size-5 text-neutral-700 transition-colors duration-200 group-hover:text-black group-hover:scale-110" />
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

			{/* ==============================================================
			    7. PUBLIC CALL TO ACTION (Gateway to Dashboard / Login)
			    ============================================================== */}
			<section className="bg-[#111111] text-white py-20 px-6">
				<div className="mx-auto max-w-4xl text-center">
					<span className="text-[10px] font-bold tracking-[0.35em] text-neutral-400 uppercase">
						Akses Terkelola &bull; {BRAND.name}
					</span>
					<h2 className="mt-3 font-serif text-3xl font-bold tracking-wide uppercase sm:text-4xl lg:text-5xl">
						SIAP MENGELOLA KATALOG & PENGGUNA?
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-xs font-normal leading-relaxed text-neutral-400 sm:text-sm">
						Masuk ke panel kendali administrator untuk menambah karya, mengatur inventaris,
						mengelola peran pengguna, dan memantau status keamanan in-memory.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
						{session?.user ? (
							<Link
								to="/dashboard"
								className="group inline-flex items-center gap-2 rounded-none bg-white px-8 py-3.5 text-xs font-bold tracking-[0.18em] text-[#111111] uppercase hover:bg-neutral-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shadow-md"
							>
								<span>BUKA DASHBOARD ADMIN</span>
								<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
							</Link>
						) : (
							<>
								<Link
									to="/login"
									className="group inline-flex items-center gap-2 rounded-none bg-white px-8 py-3.5 text-xs font-bold tracking-[0.18em] text-[#111111] uppercase hover:bg-neutral-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg shadow-md"
								>
									<span>MASUK KE PANEL ADMIN</span>
									<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
								</Link>
								<Link
									to="/setup"
									className="inline-flex items-center gap-2 rounded-none border border-white/30 bg-transparent px-8 py-3.5 text-xs font-bold tracking-[0.18em] text-white uppercase hover:bg-white hover:text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
								>
									<span>SEED AKUN ADMIN</span>
								</Link>
							</>
						)}
					</div>
				</div>
			</section>
		</main>
	);
}
