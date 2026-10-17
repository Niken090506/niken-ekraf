import {
	BookOpen,
	Brush,
	Building2,
	Camera,
	Film,
	Gamepad2,
	Megaphone,
	Music,
	Package,
	Palette,
	Scissors,
	Shirt,
	Sofa,
	Tv,
	UtensilsCrossed,
	VenetianMask,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Central branding + content constants for the Ekraf platform.
 *
 * Keeping these in one place means the header, footer, page titles and meta
 * tags stay in sync as the product grows (see AGENTS.md: keep structure modular).
 */
export const BRAND = {
	name: "Ekraf Hub",
	short: "Ekraf",
	tagline: "Platform Ekonomi Kreatif",
	description:
		"Ruang kerja untuk pelaku ekonomi kreatif: kelola katalog produk, pantau kinerja, dan tumbuh bersama.",
} as const;

export interface EkrafSubsector {
	slug: string;
	name: string;
	blurb: string;
	icon: LucideIcon;
	/** Accent colour used by the subsector cards (bento grid / dashboard). */
	accent: string;
}

/** The 16 official Indonesian creative-economy subsectors (Ekraf). */
export const EKRAF_SUBSECTORS: EkrafSubsector[] = [
	{
		slug: "aplikasi-game",
		name: "Aplikasi & Game",
		blurb: "Produk digital, gim, dan perangkat lunak kreatif.",
		icon: Gamepad2,
		accent: "#6366f1",
	},
	{
		slug: "arsitektur",
		name: "Arsitektur",
		blurb: "Perancangan ruang dan bangunan yang berkarakter.",
		icon: Building2,
		accent: "#0ea5e9",
	},
	{
		slug: "desain-interior",
		name: "Desain Interior",
		blurb: "Tata ruang dalam yang fungsional dan estetis.",
		icon: Sofa,
		accent: "#14b8a6",
	},
	{
		slug: "dkv",
		name: "Desain Komunikasi Visual",
		blurb: "Identitas visual, grafis, dan komunikasi merek.",
		icon: Palette,
		accent: "#ec4899",
	},
	{
		slug: "desain-produk",
		name: "Desain Produk",
		blurb: "Pengembangan produk fungsional bernilai jual.",
		icon: Package,
		accent: "#f97316",
	},
	{
		slug: "film-animasi-video",
		name: "Film, Animasi & Video",
		blurb: "Produksi konten bergerak dan sinematik.",
		icon: Film,
		accent: "#ef4444",
	},
	{
		slug: "fotografi",
		name: "Fotografi",
		blurb: "Visualisasi gambar untuk komersial dan seni.",
		icon: Camera,
		accent: "#8b5cf6",
	},
	{
		slug: "kriya",
		name: "Kriya",
		blurb: "Karya tangan dan kerajinan bernuansa lokal.",
		icon: Scissors,
		accent: "#d946ef",
	},
	{
		slug: "kuliner",
		name: "Kuliner",
		blurb: "Olahan makanan dan minuman khas Nusantara.",
		icon: UtensilsCrossed,
		accent: "#f59e0b",
	},
	{
		slug: "musik",
		name: "Musik",
		blurb: "Komposisi, produksi, dan pertunjukan musik.",
		icon: Music,
		accent: "#22c55e",
	},
	{
		slug: "fashion",
		name: "Fashion",
		blurb: "Busana, aksesori, dan gaya yang berkarakter.",
		icon: Shirt,
		accent: "#eab308",
	},
	{
		slug: "penerbitan",
		name: "Penerbitan",
		blurb: "Buku, konten tertulis, dan media cetak.",
		icon: BookOpen,
		accent: "#3b82f6",
	},
	{
		slug: "periklanan",
		name: "Periklanan",
		blurb: "Kampanye kreatif dan strategi promosi.",
		icon: Megaphone,
		accent: "#10b981",
	},
	{
		slug: "seni-pertunjukan",
		name: "Seni Pertunjukan",
		blurb: "Teater, tari, dan pertunjukan panggung.",
		icon: VenetianMask,
		accent: "#a855f7",
	},
	{
		slug: "seni-rupa",
		name: "Seni Rupa",
		blurb: "Lukis, patung, dan ekspresi visual murni.",
		icon: Brush,
		accent: "#0891b2",
	},
	{
		slug: "televisi-radio",
		name: "Televisi & Radio",
		blurb: "Penyiaran dan distribusi konten audio-visual.",
		icon: Tv,
		accent: "#f43f5e",
	},
];
