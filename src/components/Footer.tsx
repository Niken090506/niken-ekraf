import { BRAND } from "../lib/brand";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-white/10 bg-[#060a08] px-6 pt-16 pb-20 text-white/60">
			<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-center sm:flex-row sm:text-left">
				<div className="space-y-2">
					<div className="flex items-center justify-center gap-3 sm:justify-start">
						<div className="flex size-6 items-center justify-center border border-white/40 text-[9px] font-bold tracking-widest text-white">
							EG
						</div>
						<p className="font-serif text-sm tracking-[0.25em] text-white uppercase">
							{BRAND.name}
						</p>
					</div>
					<p className="text-xs font-light text-white/50 tracking-wide">
						&copy; {year} {BRAND.name}. Seluruh hak cipta dilindungi.
					</p>
				</div>

				<div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium tracking-[0.25em] text-white/60 uppercase sm:justify-end">
					<span>Kurasi Terpilih</span>
					<span className="text-white/20">&bull;</span>
					<span>In-Memory Atelier</span>
					<span className="text-white/20">&bull;</span>
					<span>Estetika Nusantara</span>
				</div>
			</div>
		</footer>
	);
}
