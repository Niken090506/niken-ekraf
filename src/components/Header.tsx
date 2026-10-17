import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	Heart,
	Minus,
	Package,
	Plus,
	Search,
	ShoppingBag,
	Trash2,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";

import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import { BRAND } from "../lib/brand";
import { getProducts } from "../lib/server/products";
import { useCart, useWishlist } from "../lib/store";

export default function Header() {
	const navigate = useNavigate();
	const {
		items: cartItems,
		totalCount: cartCount,
		subtotal,
		updateQuantity,
		removeItem,
		clear: clearCart,
	} = useCart();
	const { items: wishlistItems, totalCount: wishlistCount, toggle: toggleWishlist } = useWishlist();

	// Modal / Drawer visibility
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [wishlistOpen, setWishlistOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);

	// Fetch products for live search
	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});

	const allProducts = productsQuery.data ?? [];

	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) return [];
		const q = searchQuery.toLowerCase();
		return allProducts.filter(
			(p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
		);
	}, [allProducts, searchQuery]);

	return (
		<header className="sticky top-0 z-50 border-b border-[#E5E2DC] bg-[#F9F8F6]/95 backdrop-blur-md transition-all antialiased">
			{/* Top Announcement Bar (Ekraf Indonesian Curation Bar) */}
			<div className="border-b border-[#E5E2DC] bg-[#F2EFE9] px-4 py-1.5 text-center text-[10px] font-medium tracking-[0.2em] text-neutral-600 uppercase">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<span className="hidden sm:inline font-semibold text-neutral-800">
						ETALASE RESMI 16 SUBSEKTOR EKONOMI KREATIF INDONESIA
					</span>
					<span className="mx-auto font-semibold sm:mx-0">
						Kurasi Karya & Tata Kelola Kreatif Nusantara
					</span>
					<div className="hidden items-center gap-4 sm:flex">
						<span className="hover:text-black transition-colors cursor-pointer">
							Kurasi Nasional
						</span>
						<span>&bull;</span>
						<span className="hover:text-black transition-colors cursor-pointer">Panduan Ekraf</span>
					</div>
				</div>
			</div>

			{/* Main Brand Navigation Bar */}
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				{/* Left Navigation Links: HOME | KATALOG | DASHBOARD | PENGGUNA | SETUP */}
				<div className="hidden items-center gap-6 lg:flex">
					<Link
						to="/"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-all duration-200 hover:text-black hover:-translate-y-0.5"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						HOME
					</Link>
					<Link
						to="/products"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-all duration-200 hover:text-black hover:-translate-y-0.5"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						KATALOG
					</Link>
					<Link
						to="/dashboard"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-all duration-200 hover:text-black hover:-translate-y-0.5"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						DASHBOARD
					</Link>
					<Link
						to="/users"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-all duration-200 hover:text-black hover:-translate-y-0.5"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						PENGGUNA
					</Link>
					<Link
						to="/setup"
						className="text-xs font-semibold tracking-[0.18em] text-neutral-700 uppercase transition-all duration-200 hover:text-black hover:-translate-y-0.5"
						activeProps={{
							className:
								"text-xs font-bold tracking-[0.18em] text-black uppercase border-b-2 border-black pb-0.5",
						}}
					>
						SETUP
					</Link>
				</div>

				{/* Center Logo (NORD-style Bold Display Serif) */}
				<Link
					to="/"
					aria-label={`${BRAND.name} — Beranda`}
					className="group flex flex-col items-center justify-center no-underline"
				>
					<span className="font-serif text-2xl font-black tracking-[0.22em] text-[#111111] uppercase transition-transform duration-300 group-hover:scale-105 sm:text-3xl">
						NORD
					</span>
					<span className="text-[8px] font-bold tracking-[0.35em] text-neutral-500 uppercase transition-colors group-hover:text-black">
						{BRAND.short} Atelier
					</span>
				</Link>

				{/* Right Navigation Actions (Proportionate, elegant position within container) */}
				<div className="flex items-center gap-4 sm:gap-5">
					{/* Search Button */}
					<button
						type="button"
						onClick={() => setSearchOpen(true)}
						aria-label="Cari Produk"
						className="rounded-full p-2 text-neutral-700 transition-all duration-200 hover:bg-neutral-200 hover:scale-110 hover:text-black"
						title="Pencarian Cepat"
					>
						<Search className="size-4" />
					</button>

					{/* Wishlist Button */}
					<button
						type="button"
						onClick={() => setWishlistOpen(true)}
						aria-label="Wishlist"
						className="relative rounded-full p-2 text-neutral-700 transition-all duration-200 hover:bg-neutral-200 hover:scale-110 hover:text-black"
						title="Daftar Wishlist"
					>
						<Heart className={`size-4 ${wishlistCount > 0 ? "fill-red-600 text-red-600" : ""}`} />
						{wishlistCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs">
								{wishlistCount}
							</span>
						)}
					</button>

					{/* Shopping Cart Button */}
					<button
						type="button"
						onClick={() => setCartOpen(true)}
						aria-label="Keranjang Belanja"
						className="relative rounded-full p-2 text-neutral-700 transition-all duration-200 hover:bg-neutral-200 hover:scale-110 hover:text-black"
						title="Keranjang Belanja"
					>
						<ShoppingBag className="size-4" />
						{cartCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[#111111] text-[9px] font-bold !text-white shadow-xs">
								{cartCount}
							</span>
						)}
					</button>

					{/* User & Auth Menu */}
					<BetterAuthHeader />
				</div>
			</nav>

			{/* Mobile Nav Strip: HOME | KATALOG | DASHBOARD | PENGGUNA | SETUP */}
			<div className="flex items-center justify-around border-t border-[#E5E2DC] bg-[#F2EFE9]/50 py-2.5 lg:hidden">
				<Link
					to="/"
					className="text-[10px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[10px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					HOME
				</Link>
				<Link
					to="/products"
					className="text-[10px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[10px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					KATALOG
				</Link>
				<Link
					to="/dashboard"
					className="text-[10px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[10px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					DASHBOARD
				</Link>
				<Link
					to="/users"
					className="text-[10px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[10px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					PENGGUNA
				</Link>
				<Link
					to="/setup"
					className="text-[10px] font-semibold tracking-wider text-neutral-600 uppercase hover:text-black"
					activeProps={{
						className:
							"text-[10px] font-bold tracking-wider text-black uppercase border-b-2 border-black",
					}}
				>
					SETUP
				</Link>
			</div>

			{/* ==============================================================
			    1. INTERACTIVE SEARCH MODAL
			    ============================================================== */}
			{searchOpen && (
				<div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
					<div
						className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
						onClick={() => setSearchOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setSearchOpen(false);
						}}
						role="presentation"
					/>
					<div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-2xl">
						<div className="flex items-center gap-3 border-b border-[#E5E2DC] pb-3">
							<Search className="size-5 text-neutral-400" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Ketik nama produk, deskripsi, atau kategori..."
								className="w-full text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none"
							/>
							<button
								type="button"
								onClick={() => setSearchOpen(false)}
								className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-black"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Results preview */}
						<div className="mt-4 max-h-80 overflow-y-auto">
							{searchQuery.trim() === "" ? (
								<p className="py-6 text-center text-xs text-neutral-400">
									Mulai mengetik untuk mencari dari seluruh katalog produk...
								</p>
							) : searchResults.length === 0 ? (
								<p className="py-6 text-center text-xs text-neutral-500">
									Tidak ditemukan produk dengan kata kunci "{searchQuery}".
								</p>
							) : (
								<div className="space-y-2">
									{searchResults.map((product) => (
										<button
											type="button"
											key={product.id}
											onClick={() => {
												setSearchOpen(false);
												navigate({ to: "/products/$productId", params: { productId: product.id } });
											}}
											className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left transition-colors hover:bg-[#F9F8F6]"
										>
											<div className="flex items-center gap-3">
												{product.imageUrl ? (
													<img
														src={product.imageUrl}
														alt={product.name}
														className="size-10 rounded-md border border-[#E5E2DC] object-cover"
													/>
												) : (
													<div className="flex size-10 items-center justify-center rounded-md border border-[#E5E2DC] bg-neutral-100 text-neutral-400">
														<Package className="size-4" />
													</div>
												)}
												<div>
													<p className="text-xs font-bold text-neutral-900">{product.name}</p>
													<p className="line-clamp-1 text-[11px] text-neutral-500">
														{product.description}
													</p>
												</div>
											</div>
											<span className="font-sans text-xs font-bold text-neutral-950">
												${Number(product.price).toFixed(2)}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* ==============================================================
			    2. INTERACTIVE WISHLIST DRAWER
			    ============================================================== */}
			{wishlistOpen && (
				<div className="fixed inset-0 z-50 flex justify-end">
					<div
						className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
						onClick={() => setWishlistOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setWishlistOpen(false);
						}}
						role="presentation"
					/>
					<div className="relative flex h-full w-full max-w-md flex-col border-l border-[#E5E2DC] bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
							<div className="flex items-center gap-2">
								<Heart className="size-5 fill-red-600 text-red-600" />
								<h2 className="font-serif text-lg font-bold text-neutral-950 uppercase tracking-wide">
									Wishlist ({wishlistCount})
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setWishlistOpen(false)}
								className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="mt-4 flex-1 overflow-y-auto">
							{wishlistItems.length === 0 ? (
								<div className="py-16 text-center text-xs text-neutral-500">
									<Heart className="mx-auto size-8 text-neutral-300" />
									<p className="mt-2 font-semibold">Wishlist Anda masih kosong</p>
									<p className="mt-1 text-neutral-400">
										Simpan item favorit Anda dengan mengklik ikon hati di katalog.
									</p>
								</div>
							) : (
								<div className="divide-y divide-[#E5E2DC]">
									{wishlistItems.map((item) => (
										<div key={item.id} className="flex items-center justify-between py-3.5">
											<div className="flex items-center gap-3">
												{item.imageUrl ? (
													<img
														src={item.imageUrl}
														alt={item.name}
														className="size-12 rounded-md border border-[#E5E2DC] object-cover"
													/>
												) : (
													<div className="flex size-12 items-center justify-center rounded-md border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-400">
														<Package className="size-5" />
													</div>
												)}
												<div>
													<p className="text-xs font-bold text-neutral-900">{item.name}</p>
													<p className="text-xs font-bold text-neutral-950">
														${Number(item.price).toFixed(2)}
													</p>
												</div>
											</div>
											<button
												type="button"
												onClick={() => toggleWishlist(item)}
												className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
												title="Hapus dari Wishlist"
											>
												<Trash2 className="size-4" />
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="border-t border-[#E5E2DC] pt-4">
							<Link
								to="/products"
								onClick={() => setWishlistOpen(false)}
								className="flex w-full items-center justify-center gap-2 rounded-none bg-[#111111] py-3 text-xs font-bold tracking-wider text-white uppercase hover:bg-neutral-800 shadow-sm [&_svg]:text-white"
							>
								<span>Lihat Katalog Produk</span>
								<ArrowRight className="size-3.5 text-white" />
							</Link>
						</div>
					</div>
				</div>
			)}

			{/* ==============================================================
			    3. INTERACTIVE SHOPPING CART DRAWER
			    ============================================================== */}
			{cartOpen && (
				<div className="fixed inset-0 z-50 flex justify-end">
					<div
						className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
						onClick={() => setCartOpen(false)}
						onKeyDown={(e) => {
							if (e.key === "Escape") setCartOpen(false);
						}}
						role="presentation"
					/>
					<div className="relative flex h-full w-full max-w-md flex-col border-l border-[#E5E2DC] bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
							<div className="flex items-center gap-2">
								<ShoppingBag className="size-5 text-neutral-900" />
								<h2 className="font-serif text-lg font-bold text-neutral-950 uppercase tracking-wide">
									Keranjang ({cartCount})
								</h2>
							</div>
							<button
								type="button"
								onClick={() => setCartOpen(false)}
								className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-black"
							>
								<X className="size-4" />
							</button>
						</div>

						<div className="mt-4 flex-1 overflow-y-auto">
							{cartItems.length === 0 ? (
								<div className="py-16 text-center text-xs text-neutral-500">
									<ShoppingBag className="mx-auto size-8 text-neutral-300" />
									<p className="mt-2 font-semibold">Keranjang Anda masih kosong</p>
									<p className="mt-1 text-neutral-400">
										Tambahkan produk karya kreatif dari katalog untuk memulai pemesanan.
									</p>
								</div>
							) : (
								<div className="divide-y divide-[#E5E2DC]">
									{cartItems.map((item) => (
										<div key={item.id} className="flex items-center justify-between py-3.5">
											<div className="flex items-center gap-3">
												{item.imageUrl ? (
													<img
														src={item.imageUrl}
														alt={item.name}
														className="size-12 rounded-md border border-[#E5E2DC] object-cover"
													/>
												) : (
													<div className="flex size-12 items-center justify-center rounded-md border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-400">
														<Package className="size-5" />
													</div>
												)}
												<div>
													<p className="text-xs font-bold text-neutral-900">{item.name}</p>
													<p className="text-xs font-bold text-neutral-950">
														${Number(item.price).toFixed(2)}
													</p>
												</div>
											</div>

											{/* Quantity Controls */}
											<div className="flex items-center gap-2">
												<div className="flex items-center rounded-md border border-[#E5E2DC] bg-[#F9F8F6]">
													<button
														type="button"
														onClick={() => updateQuantity(item.id, -1)}
														className="p-1 text-neutral-600 hover:text-black"
													>
														<Minus className="size-3" />
													</button>
													<span className="px-2 text-xs font-bold">{item.quantity}</span>
													<button
														type="button"
														onClick={() => updateQuantity(item.id, 1)}
														className="p-1 text-neutral-600 hover:text-black"
													>
														<Plus className="size-3" />
													</button>
												</div>
												<button
													type="button"
													onClick={() => removeItem(item.id)}
													className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
													title="Hapus item"
												>
													<Trash2 className="size-3.5" />
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Subtotal & Checkout Actions */}
						{cartItems.length > 0 && (
							<div className="border-t border-[#E5E2DC] pt-4">
								<div className="mb-4 flex items-center justify-between">
									<span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
										Subtotal
									</span>
									<span className="font-sans text-base font-black text-neutral-950">
										${subtotal.toFixed(2)}
									</span>
								</div>
								<div className="space-y-2">
									<button
										type="button"
										onClick={() => {
											alert(
												"Simulasi checkout berhasil! Terima kasih telah mengapresiasi karya ekonomi kreatif.",
											);
											clearCart();
											setCartOpen(false);
										}}
										className="flex w-full items-center justify-center gap-2 rounded-none bg-[#111111] py-3 text-xs font-bold tracking-wider !text-white text-white uppercase hover:bg-neutral-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm [&_svg]:!text-white [&_svg]:text-white"
									>
										<span className="!text-white text-white">Proses Checkout</span>
										<ArrowRight className="size-3.5 !text-white text-white" />
									</button>
									<button
										type="button"
										onClick={clearCart}
										className="w-full text-center text-[11px] font-bold text-neutral-500 hover:text-red-600 uppercase tracking-wider py-1.5 transition-colors"
									>
										Kosongkan Keranjang
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
