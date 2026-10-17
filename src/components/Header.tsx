import { Link } from "@tanstack/react-router";
import BetterAuthHeader from "../integrations/better-auth/header-user.tsx";
import { BRAND } from "../lib/brand";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-white/10 bg-[#090e0c]/85 px-6 backdrop-blur-xl transition-all">
			<nav className="mx-auto flex max-w-7xl items-center justify-between py-4">
				{/* Editorial Insignia Logo */}
				<Link
					to="/"
					aria-label={`${BRAND.name} — Beranda`}
					className="group flex items-center gap-3 no-underline"
				>
					{/* Minimalist crest / heraldic badge */}
					<div className="flex size-8 items-center justify-center border border-white/40 p-1 text-[10px] font-bold tracking-widest text-white transition-all group-hover:border-white group-hover:bg-white group-hover:text-black">
						EG
					</div>
					<div className="flex flex-col">
						<span className="font-serif text-sm font-medium tracking-[0.25em] text-white uppercase">
							{BRAND.short}
						</span>
						<span className="text-[9px] font-light tracking-[0.3em] text-white/50 uppercase">
							Est. 2026 &bull; Atelier
						</span>
					</div>
				</Link>

				{/* Magazine Style Center Navigation Links */}
				<div className="hidden items-center gap-8 md:flex">
					<Link
						to="/"
						className="text-[11px] font-medium tracking-[0.25em] text-white/70 uppercase transition-colors hover:text-white"
						activeProps={{
							className:
								"text-[11px] font-medium tracking-[0.25em] text-white uppercase border-b border-white pb-0.5",
						}}
					>
						Beranda
					</Link>
					<Link
						to="/products"
						className="text-[11px] font-medium tracking-[0.25em] text-white/70 uppercase transition-colors hover:text-white"
						activeProps={{
							className:
								"text-[11px] font-medium tracking-[0.25em] text-white uppercase border-b border-white pb-0.5",
						}}
					>
						Katalog
					</Link>
					<Link
						to="/dashboard"
						className="text-[11px] font-medium tracking-[0.25em] text-white/70 uppercase transition-colors hover:text-white"
						activeProps={{
							className:
								"text-[11px] font-medium tracking-[0.25em] text-white uppercase border-b border-white pb-0.5",
						}}
					>
						Dashboard
					</Link>
					<Link
						to="/users"
						className="text-[11px] font-medium tracking-[0.25em] text-white/70 uppercase transition-colors hover:text-white"
						activeProps={{
							className:
								"text-[11px] font-medium tracking-[0.25em] text-white uppercase border-b border-white pb-0.5",
						}}
					>
						Pengguna
					</Link>
					<Link
						to="/setup"
						className="text-[11px] font-medium tracking-[0.25em] text-white/50 uppercase transition-colors hover:text-white"
						activeProps={{
							className:
								"text-[11px] font-medium tracking-[0.25em] text-white uppercase border-b border-white pb-0.5",
						}}
					>
						Setup
					</Link>
				</div>

				{/* Right Actions */}
				<div className="flex items-center gap-4">
					<BetterAuthHeader />
					<ThemeToggle />
				</div>
			</nav>

			{/* Mobile Nav Strip */}
			<div className="flex items-center justify-around border-t border-white/5 py-2.5 md:hidden">
				<Link
					to="/"
					className="text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white"
					activeProps={{
						className: "text-[10px] tracking-[0.2em] text-white font-semibold uppercase",
					}}
				>
					Beranda
				</Link>
				<Link
					to="/products"
					className="text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white"
					activeProps={{
						className: "text-[10px] tracking-[0.2em] text-white font-semibold uppercase",
					}}
				>
					Katalog
				</Link>
				<Link
					to="/dashboard"
					className="text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white"
					activeProps={{
						className: "text-[10px] tracking-[0.2em] text-white font-semibold uppercase",
					}}
				>
					Admin
				</Link>
				<Link
					to="/setup"
					className="text-[10px] tracking-[0.2em] text-white/70 uppercase hover:text-white"
					activeProps={{
						className: "text-[10px] tracking-[0.2em] text-white font-semibold uppercase",
					}}
				>
					Setup
				</Link>
			</div>
		</header>
	);
}
