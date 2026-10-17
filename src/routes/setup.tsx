import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import { seedAdmin } from "@/lib/server/auth";

export const Route = createFileRoute("/setup")({ component: Setup });

function Setup() {
	const seedAdminFn = useServerFn(seedAdmin);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleSeed = async () => {
		setStatus("loading");
		setMessage("");
		try {
			const result = await seedAdminFn();
			setStatus("success");
			setMessage(
				result.alreadySeeded
					? "Akun Administrator dan data sampel sudah aktif di memori server."
					: "Akun Administrator berhasil dibuat dan data sampel telah dimasukkan ke memori server.",
			);
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "Inisialisasi seed gagal.");
		}
	};

	return (
		<main className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-[#F9F8F6] px-4 py-16 antialiased">
			<section className="relative w-full max-w-xl rounded-xl border border-[#E5E2DC] bg-white p-8 shadow-xs sm:p-10">
				<div className="mb-4 inline-flex items-center gap-1.5 rounded-none border border-[#E5E2DC] bg-[#F2EFE9] px-3 py-1 text-[10px] font-bold tracking-widest text-neutral-800 uppercase">
					<Sparkles className="size-3" />
					<span>Inisialisasi Sistem</span>
				</div>

				<h1 className="font-serif text-2xl font-bold tracking-wide text-neutral-950 uppercase sm:text-3xl">
					Seed Akun Admin
				</h1>
				<p className="mt-3 text-xs leading-relaxed text-neutral-600 sm:text-sm">
					Fungsi ini bersifat <strong>idempoten</strong> (aman dijalankan berulang kali). Fungsi ini
					akan membuat akun admin dengan kredensial bawaan serta produk sampel ekonomi kreatif ke
					dalam memori server.
				</p>

				{/* Credentials info box */}
				<div className="mt-6 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-4">
					<p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">
						Kredensial Default
					</p>
					<div className="mt-3 space-y-2 text-xs text-neutral-800">
						<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-1.5">
							<span className="text-neutral-500">Email:</span>
							<code className="rounded bg-white px-2 py-0.5 font-mono font-bold text-neutral-900 border border-[#E5E2DC]">
								admin@example.com
							</code>
						</div>
						<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-1.5">
							<span className="text-neutral-500">Password:</span>
							<code className="rounded bg-white px-2 py-0.5 font-mono font-bold text-neutral-900 border border-[#E5E2DC]">
								admin12345
							</code>
						</div>
						<div className="flex items-center justify-between pt-0.5">
							<span className="text-neutral-500">Peran:</span>
							<span className="inline-flex items-center gap-1 font-bold text-neutral-950">
								<ShieldCheck className="size-3.5" />
								admin (root guard)
							</span>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
					<button
						type="button"
						onClick={handleSeed}
						disabled={status === "loading"}
						className="inline-flex items-center justify-center gap-2 rounded-none bg-[#111111] px-6 py-3 text-xs font-bold tracking-wider !text-white text-white uppercase transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg shadow-sm disabled:opacity-50 [&_svg]:!text-white [&_svg]:text-white"
					>
						<KeyRound className="size-4 !text-white text-white" />
						<span className="!text-white text-white">
							{status === "loading" ? "Memproses Seed..." : "Jalankan Seed Admin"}
						</span>
					</button>

					<Link
						to="/login"
						className="inline-flex items-center justify-center gap-1.5 rounded-none border border-[#E5E2DC] bg-white px-6 py-3 text-xs font-bold tracking-wider text-neutral-800 uppercase transition-all duration-200 hover:bg-neutral-100 hover:border-black"
					>
						<span>Halaman Masuk</span>
						<ArrowRight className="size-4" />
					</Link>
				</div>

				{status !== "idle" && (
					<div
						className={`mt-6 flex items-start gap-3 rounded-lg border p-4 text-xs leading-relaxed ${
							status === "success"
								? "border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold"
								: status === "error"
									? "border-red-200 bg-red-50 text-red-600 font-semibold"
									: "border-[#E5E2DC] bg-[#F9F8F6] text-neutral-800"
						}`}
					>
						<CheckCircle2 className="mt-0.5 size-4 shrink-0" />
						<div>
							<p className="font-bold">
								{status === "success" ? "Status Seed Berhasil" : "Status Seed"}
							</p>
							<p className="mt-0.5 font-normal">{message}</p>
						</div>
					</div>
				)}
			</section>
		</main>
	);
}
