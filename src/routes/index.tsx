import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Compass, Feather, Mountain, Shield } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { BRAND, EKRAF_SUBSECTORS } from "@/lib/brand";
import { getMyRole } from "@/lib/server/auth";
import { getProducts } from "@/lib/server/products";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const { data: session } = authClient.useSession();
	const isAuthed = Boolean(session?.user);

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
		enabled: isAuthed,
	});

	const roleQuery = useQuery({
		queryKey: ["me", "role"],
		queryFn: async () => getMyRole(),
		enabled: isAuthed,
	});

	const featured = productsQuery.data?.[0];
	const role = roleQuery.data?.role;

	return (
		<main className="relative bg-[#090e0c] text-white selection:bg-white selection:text-black">
			{/* Vertical Pagination Dots (Matching Editorial Reference Image) */}
			<div
				className="fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
				aria-hidden="true"
			>
				<span className="size-2 rounded-full bg-white ring-4 ring-white/20" />
				<span className="size-1.5 rounded-full bg-white/30" />
				<span className="size-1.5 rounded-full bg-white/30" />
				<span className="size-1.5 rounded-full bg-white/30" />
			</div>

			{/* ==============================================================
			    HERO SECTION (Slide 1: Immersive Misty Forest & Crest Emblem)
			    ============================================================== */}
			<section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 py-24 text-center">
				{/* Full-Bleed Misty Forest Photography Background */}
				<div
					className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage:
							"url('https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=2560&q=85')",
					}}
				>
					{/* Dark Muted Overlay for Crisp Editorial Typography */}
					<div className="absolute inset-0 bg-gradient-to-b from-[#090e0c]/70 via-[#090e0c]/50 to-[#090e0c]" />
				</div>

				<div className="relative z-10 mx-auto max-w-4xl">
					{/* Minimalist Heraldic Crest Logo (Inspired by "Quality Goods" badge) */}
					<div className="mx-auto mb-8 flex size-20 flex-col items-center justify-center border border-white/50 bg-black/30 p-2 shadow-2xl backdrop-blur-sm transition-transform hover:scale-105">
						<span className="text-[8px] font-semibold tracking-[0.3em] text-white/80 uppercase">
							EST. 2026
						</span>
						<span className="my-0.5 font-serif text-xs font-bold tracking-[0.25em] text-white uppercase">
							{BRAND.short}
						</span>
						<span className="text-[7px] font-light tracking-[0.35em] text-white/60 uppercase">
							ATELIER
						</span>
					</div>

					{/* Small Caps Tracking Subtitle */}
					<p className="font-mono text-[11px] font-medium tracking-[0.35em] text-white/80 uppercase sm:text-xs">
						KURASI KARYA {BRAND.name.toUpperCase()} &bull; EDISI ALAM
					</p>

					{/* Grand Serif Editorial Heading */}
					<h1 className="mt-4 font-serif text-4xl font-normal tracking-[0.08em] text-white uppercase sm:text-6xl lg:text-7xl">
						SUNDAY EKRAF THEME
					</h1>

					{/* Refined Narrative Paragraph */}
					<p className="mx-auto mt-6 max-w-2xl text-xs font-light leading-relaxed tracking-wider text-white/85 sm:text-sm">
						Ketika ketukangan luhur berpadu dengan keheningan hutan berkabut. Setiap karya dikurasi
						dengan presisi artistik, diotentikasi secara aman, dan dikelola dalam arsitektur digital
						tanpa jejak server fisik.
					</p>

					{/* Minimalist Outline Buttons (No neon, pure high-end aesthetic) */}
					<div className="mt-10 flex flex-wrap items-center justify-center gap-5">
						<Link
							to={isAuthed ? "/dashboard" : "/login"}
							className="border border-white/60 bg-transparent px-8 py-3.5 text-xs font-medium tracking-[0.25em] text-white uppercase transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
						>
							{isAuthed ? "Buka Dashboard" : "Masuk Sistem"}
						</Link>
						<Link
							to="/products"
							className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-white/80 uppercase transition-colors hover:text-white"
						>
							<span>Jelajahi Katalog</span>
							<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
						</Link>
					</div>

					{/* Authenticated user indicator */}
					{isAuthed && session?.user && (
						<div className="mt-8 inline-flex items-center gap-2 border border-white/20 bg-black/40 px-4 py-1.5 text-[11px] font-light tracking-widest text-white/90 backdrop-blur-md uppercase">
							<span className="size-1.5 rounded-full bg-white" />
							<span>
								Masuk sebagai {session.user.name || session.user.email} &bull; Peran:{" "}
								{role || "User"}
							</span>
						</div>
					)}
				</div>
			</section>

			{/* ==============================================================
			    FEATURED LOOKBOOK & DOUBLE EXPOSURE ART (Slide 2 Style)
			    ============================================================== */}
			<section className="relative border-t border-white/10 bg-[#0c1411] px-6 py-28">
				<div className="mx-auto max-w-6xl">
					<div className="text-center">
						<p className="font-mono text-[11px] font-medium tracking-[0.35em] text-white/60 uppercase">
							FOLLOW ALL THE NEWS AND STORIES
						</p>
						<h2 className="mt-3 font-serif text-3xl font-normal tracking-[0.1em] text-white uppercase sm:text-5xl">
							EXCLUSIVE DESIGN & GOODS
						</h2>

						{/* Delicate Hairline Divider with Emblem */}
						<div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4">
							<div className="h-px flex-1 bg-white/20" />
							<div className="flex size-7 items-center justify-center border border-white/30 text-white/70">
								<Feather className="size-3.5" />
							</div>
							<div className="h-px flex-1 bg-white/20" />
						</div>

						<p className="mx-auto mt-6 max-w-2xl text-xs font-light leading-relaxed tracking-wider text-white/70 sm:text-sm">
							"Karya sejati adalah jembatan antara inspirasi alam liar dan kecakapan cipta manusia.
							Kami mengurasi karya terbaik untuk menghadirkan nilai otentik bagi ekosistem kreatif."
						</p>
					</div>

					{/* Two-Column Gallery Display (Left: Double Exposure Photo; Right: Curated Product) */}
					<div className="mt-16 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
						{/* Left: Atmospheric Nature Visual */}
						<div className="relative overflow-hidden border border-white/15 bg-black/30 lg:col-span-7">
							<div className="aspect-[16/10] overflow-hidden">
								<img
									src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1800&q=85"
									alt="Misty forest wilderness"
									className="size-full object-cover grayscale transition-transform duration-700 hover:scale-105"
								/>
							</div>
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
								<span className="font-mono text-[10px] tracking-[0.3em] text-white/70 uppercase">
									ATELIER ARCHIVE &bull; VOL. 01
								</span>
								<h3 className="mt-1 font-serif text-lg tracking-wider text-white uppercase">
									The Wilderness Resonance
								</h3>
							</div>
						</div>

						{/* Right: Featured Catalog Item / Minimalist Description */}
						<div className="space-y-6 lg:col-span-5">
							<div className="border-b border-white/10 pb-6">
								<span className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">
									Katalog Terpilih
								</span>
								<h3 className="mt-2 font-serif text-2xl font-normal tracking-wide text-white uppercase sm:text-3xl">
									{featured ? featured.name : "Starter Kit Ekraf Atelier"}
								</h3>
								<p className="mt-3 text-xs font-light leading-relaxed text-white/70">
									{featured
										? featured.description
										: "Koleksi kurasi alat kreasi dan instrumen digital untuk kreator seni, fesyen, dan aplikasi mandiri."}
								</p>
							</div>

							<div className="flex items-baseline justify-between py-2">
								<div>
									<span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
										Investasi
									</span>
									<p className="font-serif text-2xl text-white">
										${featured ? Number(featured.price).toFixed(2) : "49.00"}
									</p>
								</div>
								<div className="text-right">
									<span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
										Status
									</span>
									<p className="text-xs font-light text-white/80">
										{featured && featured.stock > 0
											? `${featured.stock} Unit Tersedia`
											: "Tersedia di Katalog"}
									</p>
								</div>
							</div>

							<div className="pt-4">
								<Link
									to="/products"
									className="block w-full border border-white/40 bg-transparent py-3.5 text-center text-xs font-medium tracking-[0.25em] text-white uppercase transition-all hover:bg-white hover:text-black"
								>
									Lihat Seluruh Katalog
								</Link>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    MOUNTAIN PANORAMA & 3 EDITORIAL COLUMNS (Slide 3 Style)
			    ============================================================== */}
			<section className="relative px-6 py-32 text-center">
				{/* Dramatic Mountain Clouds Panorama Background */}
				<div
					className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
					style={{
						backgroundImage:
							"url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85')",
					}}
				>
					<div className="absolute inset-0 bg-black/65" />
				</div>

				<div className="relative z-10 mx-auto max-w-6xl">
					{/* Centered Crest Icon */}
					<div className="mx-auto mb-6 flex size-12 items-center justify-center border border-white/40 text-white">
						<Mountain className="size-5" />
					</div>

					<p className="font-mono text-[11px] font-medium tracking-[0.35em] text-white/70 uppercase">
						PRINSIP DASAR ATELIER
					</p>
					<h2 className="mt-2 font-serif text-3xl font-normal tracking-[0.1em] text-white uppercase sm:text-4xl">
						LANDASAN EKOSISTEM
					</h2>

					{/* 3 Clean Editorial Columns at Bottom (Matching Slide 3) */}
					<div className="mt-20 grid gap-10 text-left sm:grid-cols-3">
						<div className="border-t border-white/20 pt-6">
							<div className="mb-4 flex size-8 items-center justify-center border border-white/30 text-white/80">
								<Shield className="size-4" />
							</div>
							<h3 className="font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase">
								01. KEDAULATAN KARYA
							</h3>
							<p className="mt-3 text-xs font-light leading-relaxed text-white/70">
								Setiap aset dan identitas produk terlindungi secara kriptografis oleh Better Auth
								dengan pemisahan akses peran administrator dan pengguna yang tegas.
							</p>
						</div>

						<div className="border-t border-white/20 pt-6">
							<div className="mb-4 flex size-8 items-center justify-center border border-white/30 text-white/80">
								<Compass className="size-4" />
							</div>
							<h3 className="font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase">
								02. IN-MEMORY SPEED
							</h3>
							<p className="mt-3 text-xs font-light leading-relaxed text-white/70">
								Beroperasi dalam memori sementara serverless tanpa ketergantungan database fisik,
								menghasilkan respons instan dan privasi data mutlak saat proses berakhir.
							</p>
						</div>

						<div className="border-t border-white/20 pt-6">
							<div className="mb-4 flex size-8 items-center justify-center border border-white/30 text-white/80">
								<Feather className="size-4" />
							</div>
							<h3 className="font-mono text-xs font-semibold tracking-[0.25em] text-white uppercase">
								03. KONTROL TANPA CACAT
							</h3>
							<p className="mt-3 text-xs font-light leading-relaxed text-white/70">
								Proteksi bawaan anti self-demotion dan self-deletion memastikan administrator
								terakhir tidak pernah terkunci dari sistem pengelolaan.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ==============================================================
			    16 SUBSEKTOR EKRAF GALLERY LOOKBOOK
			    ============================================================== */}
			<section className="relative border-t border-white/10 bg-[#090e0c] px-6 py-28">
				<div className="mx-auto max-w-6xl">
					<div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
						<div>
							<span className="font-mono text-[10px] tracking-[0.3em] text-white/50 uppercase">
								ARCHIVE INDEX
							</span>
							<h2 className="mt-2 font-serif text-3xl font-normal tracking-[0.1em] text-white uppercase sm:text-4xl">
								16 SUBSEKTOR EKONOMI KREATIF
							</h2>
						</div>
						<p className="max-w-xs text-xs font-light leading-relaxed text-white/60">
							Dokumentasi lengkap pilar ekonomi kreatif nusantara dari kriya tradisional hingga
							inovasi digital.
						</p>
					</div>

					{/* Lookbook Grid with generous whitespace and thin borders */}
					<div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
						{EKRAF_SUBSECTORS.map((sector, index) => {
							const roman = [
								"I",
								"II",
								"III",
								"IV",
								"V",
								"VI",
								"VII",
								"VIII",
								"IX",
								"X",
								"XI",
								"XII",
								"XIII",
								"XIV",
								"XV",
								"XVI",
							][index];
							return (
								<Link
									key={sector.slug}
									to="/products"
									className="group flex flex-col justify-between bg-[#090e0c] p-7 transition-colors duration-300 hover:bg-[#111a16]"
								>
									<div>
										<span className="font-mono text-[11px] font-light text-white/40">{roman}.</span>
										<h3 className="mt-3 font-serif text-base tracking-wide text-white uppercase transition-colors group-hover:text-white">
											{sector.name}
										</h3>
										<p className="mt-2 text-xs font-light leading-relaxed text-white/60">
											{sector.blurb}
										</p>
									</div>
									<div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-[10px] font-mono tracking-widest text-white/40 uppercase group-hover:text-white/80">
										<span>LIHAT KATALOG</span>
										<ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			</section>

			{/* ==============================================================
			    MINIMALIST CLOSING CALL TO ACTION
			    ============================================================== */}
			<section className="relative px-6 py-28 text-center border-t border-white/10">
				<div className="mx-auto max-w-3xl">
					<div className="mx-auto mb-6 flex size-12 items-center justify-center border border-white/40 text-white">
						<Feather className="size-5" />
					</div>
					<span className="font-mono text-[10px] tracking-[0.3em] text-white/60 uppercase">
						ATELIER EKRAF ARCHIVE
					</span>
					<h2 className="mt-4 font-serif text-3xl font-normal tracking-[0.1em] text-white uppercase sm:text-5xl">
						BERGABUNG DENGAN ATELIER EKRAF
					</h2>
					<p className="mx-auto mt-4 max-w-lg text-xs font-light leading-relaxed tracking-wider text-white/70">
						Kelola katalog produk, lindungi karya kreatif, dan integrasikan identitas autentik Anda
						dalam hitungan detik.
					</p>

					<div className="mt-10 flex flex-wrap justify-center gap-4">
						<Link
							to={isAuthed ? "/dashboard" : "/login"}
							className="border border-white/60 bg-transparent px-9 py-3.5 text-xs font-medium tracking-[0.25em] text-white uppercase transition-all duration-300 hover:border-white hover:bg-white hover:text-black"
						>
							{isAuthed ? "Buka Dashboard" : "Masuk ke Sistem"}
						</Link>
						<Link
							to="/setup"
							className="border border-white/20 bg-white/5 px-9 py-3.5 text-xs font-medium tracking-[0.25em] text-white/80 uppercase transition-all hover:border-white/40 hover:text-white"
						>
							Seed Akun Admin
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
