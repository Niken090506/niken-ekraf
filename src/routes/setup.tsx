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
					? "Akun Administrator dan data sampel sudah aktif di memori."
					: "Akun Administrator berhasil dibuat dan data sampel telah dimasukkan ke memori server.",
			);
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "Inisialisasi seed gagal.");
		}
	};

	return (
		<main className="relative flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-16">
			{/* Ambient Light */}
			<div
				className="pointer-events-none absolute -top-12 left-1/2 size-96 -translate-x-1/2 rounded-full bg-teal-500/15 blur-[120px]"
				aria-hidden="true"
			/>

			<section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
				<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
					<Sparkles className="size-3.5" />
					<span>Inisialisasi Sistem</span>
				</div>

				<h1 className="font-serif text-3xl font-normal text-white sm:text-4xl">Seed Akun Admin</h1>
				<p className="mt-3 text-sm leading-relaxed text-slate-400">
					Fungsi ini bersifat <strong>idempoten</strong> (aman dijalankan berulang kali). Fungsi ini
					akan membuat akun admin dengan kredensial bawaan serta 3 produk sampel ekonomi kreatif ke
					dalam memori server.
				</p>

				{/* Credentials info box */}
				<div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
					<p className="text-xs font-semibold tracking-wider text-teal-400 uppercase">
						Kredensial Default
					</p>
					<div className="mt-2 space-y-1.5 text-xs text-slate-300">
						<div className="flex items-center gap-2">
							<span className="text-slate-500">Email:</span>
							<code className="rounded bg-white/10 px-2 py-0.5 font-mono text-teal-200">
								admin@example.com
							</code>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-slate-500">Password:</span>
							<code className="rounded bg-white/10 px-2 py-0.5 font-mono text-teal-200">
								admin12345
							</code>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-slate-500">Role:</span>
							<span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
								<ShieldCheck className="size-3.5" />
								admin
							</span>
						</div>
					</div>
				</div>

				<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
					<button
						type="button"
						onClick={handleSeed}
						disabled={status === "loading"}
						className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] active:scale-[0.98] disabled:opacity-50"
					>
						<KeyRound className="size-4" />
						{status === "loading" ? "Memproses Seed..." : "Jalankan Seed Admin"}
					</button>

					<Link
						to="/login"
						className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
					>
						<span>Halaman Masuk</span>
						<ArrowRight className="size-4" />
					</Link>
				</div>

				{status !== "idle" && (
					<div
						className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-xs leading-relaxed ${
							status === "success"
								? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
								: status === "error"
									? "border-red-500/30 bg-red-500/10 text-red-300"
									: "border-white/10 bg-white/5 text-slate-300"
						}`}
					>
						<CheckCircle2 className="mt-0.5 size-4 shrink-0" />
						<div>
							<p className="font-semibold">
								{status === "success" ? "Status Seed Berhasil" : "Status Seed"}
							</p>
							<p className="mt-1">{message}</p>
						</div>
					</div>
				)}
			</section>
		</main>
	);
}
