import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldAlert, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { BRAND } from "@/lib/brand";
import { checkLoginRateLimit, getServerSession, reportLoginAttempt } from "@/lib/server/auth";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (session) {
			throw redirect({ to: "/dashboard" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const checkRateLimitFn = useServerFn(checkLoginRateLimit);
	const reportAttemptFn = useServerFn(reportLoginAttempt);

	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [lockoutSeconds, setLockoutSeconds] = useState(0);

	// Handle countdown for rate-limiting lockout
	useEffect(() => {
		if (lockoutSeconds <= 0) return;
		const timer = setInterval(() => {
			setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
		}, 1000);
		return () => clearInterval(timer);
	}, [lockoutSeconds]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (lockoutSeconds > 0) {
			setError(`Terlalu banyak percobaan gagal. Silakan tunggu ${lockoutSeconds} detik.`);
			return;
		}

		setLoading(true);

		try {
			// Pre-check rate limit on server for this email
			const rateLimitStatus = await checkRateLimitFn({ data: { email } });
			if (rateLimitStatus.locked) {
				setLockoutSeconds(rateLimitStatus.remainingSeconds);
				setError(
					`Akun ini sementara terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${rateLimitStatus.remainingSeconds} detik.`,
				);
				setLoading(false);
				return;
			}

			if (isSignUp) {
				const result = await authClient.signUp.email({
					email,
					password,
					name,
				});

				if (result.error) {
					setError(result.error.message || "Pendaftaran gagal. Silakan coba kembali.");
					await reportAttemptFn({ data: { email, success: false } });
				} else {
					await reportAttemptFn({ data: { email, success: true } });
					navigate({ to: "/dashboard" });
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				});

				if (result.error) {
					setError(result.error.message || "Email atau kata sandi tidak sesuai.");
					const report = await reportAttemptFn({ data: { email, success: false } });
					if (report.locked) {
						setLockoutSeconds(report.remainingSeconds);
						setError(
							`Terlalu banyak percobaan gagal (${report.attempts}x). Akun terkunci sementara selama 60 detik.`,
						);
					}
				} else {
					await reportAttemptFn({ data: { email, success: true } });
					navigate({ to: "/dashboard" });
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak terduga.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-16">
			{/* Ambient Glowing Web3 Auroras */}
			<div
				className="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-teal-500/15 blur-[120px]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute -bottom-20 right-1/4 size-80 rounded-full bg-emerald-500/10 blur-[100px]"
				aria-hidden="true"
			/>

			{/* Centered Glassmorphic Card */}
			<div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10">
				{/* Top Branding Pill */}
				<div className="mb-6 flex items-center justify-between">
					<div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
						<Sparkles className="size-3.5" />
						<span>{BRAND.short} Auth</span>
					</div>
					<Link
						to="/setup"
						className="text-xs text-teal-400/80 transition-colors hover:text-teal-300 hover:underline"
					>
						Seed Akun Admin &rarr;
					</Link>
				</div>

				{/* Title */}
				<h1 className="font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">
					{isSignUp ? "Daftar Akun" : "Selamat Datang"}
				</h1>
				<p className="mt-2 text-sm leading-relaxed text-slate-400">
					{isSignUp
						? "Lengkapi identitas untuk mendapatkan akses ke platform katalog Ekraf."
						: "Masuk ke ekosistem terkelola untuk mengelola produk dan pengguna."}
				</p>

				{/* Toggle Switch */}
				<div className="mt-6 flex border border-white/20 bg-black/40 p-1 backdrop-blur-md">
					<button
						type="button"
						onClick={() => {
							setIsSignUp(false);
							setError("");
						}}
						className={`flex-1 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all ${
							!isSignUp ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
						}`}
					>
						Masuk
					</button>
					<button
						type="button"
						onClick={() => {
							setIsSignUp(true);
							setError("");
						}}
						className={`flex-1 py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all ${
							isSignUp ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
						}`}
					>
						Daftar
					</button>
				</div>

				{/* Lockout Banner */}
				{lockoutSeconds > 0 && (
					<div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-300">
						<ShieldAlert className="mt-0.5 size-5 shrink-0" />
						<div className="text-xs">
							<p className="font-semibold">Proteksi Keamanan Aktif</p>
							<p className="mt-0.5">
								Terkunci karena proteksi brute-force. Sisa waktu: {lockoutSeconds} detik.
							</p>
						</div>
					</div>
				)}

				{/* Error Alert */}
				{error && lockoutSeconds === 0 && (
					<div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-red-300">
						<ShieldAlert className="mt-0.5 size-5 shrink-0" />
						<p className="text-xs leading-relaxed">{error}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					{isSignUp && (
						<div className="space-y-1.5">
							<label htmlFor="name" className="text-xs font-medium text-slate-300">
								Nama Lengkap
							</label>
							<div className="relative">
								<User className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. John Doe"
									required
									className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
								/>
							</div>
						</div>
					)}

					<div className="space-y-1.5">
						<label htmlFor="email" className="text-xs font-medium text-slate-300">
							Alamat Email
						</label>
						<div className="relative">
							<Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="admin@example.com"
								required
								className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-4 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="password" className="text-xs font-medium text-slate-300">
							Kata Sandi
						</label>
						<div className="relative">
							<Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								minLength={8}
								className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pr-10 pl-10 text-sm text-white placeholder-slate-500 transition-all focus:border-teal-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-teal-400/20 focus:outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition-colors hover:text-white"
							>
								{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
							</button>
						</div>
					</div>

					{/* Action Button */}
					<button
						type="submit"
						disabled={loading || lockoutSeconds > 0}
						className="mt-6 flex w-full items-center justify-center gap-2 border border-white/50 bg-transparent py-3.5 text-xs font-medium tracking-[0.25em] uppercase text-white transition-all hover:bg-white hover:text-black disabled:opacity-40"
					>
						{loading ? (
							<div className="flex items-center gap-2">
								<span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
								<span>Memproses...</span>
							</div>
						) : (
							<>
								<span>{isSignUp ? "Daftar Akun Baru" : "Masuk ke Sistem"}</span>
								<ArrowRight className="size-3.5" />
							</>
						)}
					</button>
				</form>

				{/* Footer Info */}
				<div className="mt-8 border-t border-white/10 pt-4 text-center">
					<p className="text-xs text-slate-400">
						Seed akun bawaan:{" "}
						<span className="font-mono text-teal-300">admin@example.com / admin12345</span>
					</p>
				</div>
			</div>
		</main>
	);
}
