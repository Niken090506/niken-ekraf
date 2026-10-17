import { Link } from "@tanstack/react-router";
import { Heart, Search, ShoppingBag } from "lucide-react";
import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import { BRAND } from "../lib/brand";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-[#E5E2DC] bg-[#F9F8F6]/95 backdrop-blur-md transition-all">
			{/* Top Announcement Bar (Matching NORD Reference) */}
			<div className="border-b border-[#E5E2DC] bg-[#F2EFE9] px-4 py-1.5 text-center text-[10px] font-medium tracking-[0.2em] text-neutral-600 uppercase">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<span className="hidden sm:inline">Free Shipping On Orders Above $99</span>
					<span className="mx-auto font-semibold sm:mx-0">
						Kurasi Karya Ekonomi Kreatif Terpilih
					</span>
					<div className="hidden items-center gap-4 sm:flex">
						<span>Track Order</span>
						<span>&bull;</span>
						<span>Bantuan</span>
					</div>
				</div>
			</div>

			{/* Main Brand Navigation */}
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				{/* Left Navigation Links */}
				<div className="hidden items-center gap-7 lg:flex">
					<Link
						to="/products"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:text-black"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						Katalog
					</Link>
					<Link
						to="/dashboard"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:text-black"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						Dashboard
					</Link>
					<Link
						to="/users"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:text-black"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						Pengguna
					</Link>
					<Link
						to="/setup"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-colors hover:text-black"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						Setup
					</Link>
				</div>

				{/* Center Logo (NORD-style Bold Display Serif) */}
				<Link
					to="/"
					aria-label={`${BRAND.name} — Beranda`}
					className="group flex flex-col items-center justify-center no-underline"
				>
					<span className="font-serif text-2xl font-black tracking-[0.22em] text-[#111111] uppercase transition-transform group-hover:scale-[1.02] sm:text-3xl">
						NORD
					</span>
					<span className="text-[8px] font-bold tracking-[0.35em] text-neutral-500 uppercase">
						{BRAND.short} Atelier
					</span>
				</Link>

				{/* Right Navigation Actions */}
				<div className="flex items-center gap-4 sm:gap-5">
					<Link
						to="/products"
						aria-label="Cari Produk"
						className="p-1 text-neutral-700 transition-colors hover:text-black"
					>
						<Search className="size-4" />
					</Link>
					<Link
						to="/products"
						aria-label="Wishlist"
						className="hidden p-1 text-neutral-700 transition-colors hover:text-black sm:block"
					>
						<Heart className="size-4" />
					</Link>
					<Link
						to="/products"
						aria-label="Keranjang"
						className="hidden p-1 text-neutral-700 transition-colors hover:text-black sm:block"
					>
						<ShoppingBag className="size-4" />
					</Link>
					<BetterAuthHeader />
				</div>
			</nav>

			{/* Mobile Nav Strip */}
			<div className="flex items-center justify-around border-t border-[#E5E2DC] bg-[#F2EFE9]/50 py-2.5 lg:hidden">
				<Link
					to="/"
					className="text-[11px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[11px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					Beranda
				</Link>
				<Link
					to="/products"
					className="text-[11px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[11px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					Katalog
				</Link>
				<Link
					to="/dashboard"
					className="text-[11px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[11px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					Dashboard
				</Link>
				<Link
					to="/users"
					className="text-[11px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[11px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					Pengguna
				</Link>
				<Link
					to="/setup"
					className="text-[11px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[11px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					Setup
				</Link>
			</div>
		</header>
	);
}
