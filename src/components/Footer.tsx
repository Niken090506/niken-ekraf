import { BRAND } from "../lib/brand";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-[#E5E2DC] bg-[#F2EFE9] px-6 pt-14 pb-16 text-neutral-600">
			<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-center sm:flex-row sm:text-left">
				<div className="space-y-2">
					<div className="flex items-center justify-center gap-3 sm:justify-start">
						<span className="font-serif text-lg font-black tracking-[0.2em] text-[#111111] uppercase">
							NORD &bull; {BRAND.short}
						</span>
					</div>
					<p className="text-xs text-neutral-500">
						&copy; {year} {BRAND.name}. Platform Kurasi & Tata Kelola Ekonomi Kreatif.
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold tracking-[0.18em] text-neutral-600 uppercase sm:justify-end">
					<span className="transition-colors hover:text-black">16 Subsektor</span>
					<span className="text-neutral-300">&bull;</span>
					<span className="transition-colors hover:text-black">Kurasi Terverifikasi</span>
					<span className="text-neutral-300">&bull;</span>
					<span className="transition-colors hover:text-black">In-Memory Engine</span>
				</div>
			</div>
		</footer>
	);
}
