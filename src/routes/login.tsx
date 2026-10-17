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
		<main className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-[#F9F8F6] px-4 py-16 antialiased">
			{/* Centered Luxury Card */}
			<div className="w-full max-w-md rounded-xl border border-[#E5E2DC] bg-white p-8 shadow-xs sm:p-10">
				{/* Top Branding */}
				<div className="mb-6 flex items-center justify-between border-b border-[#E5E2DC] pb-4">
					<div className="inline-flex items-center gap-1.5 rounded-none border border-[#E5E2DC] bg-[#F2EFE9] px-3 py-1 text-[10px] font-bold tracking-widest text-neutral-800 uppercase">
						<Sparkles className="size-3" />
						<span>NORD &bull; {BRAND.short}</span>
					</div>
					<Link
						to="/setup"
						className="text-xs font-bold text-neutral-600 hover:text-black hover:underline"
					>
						Seed Admin &rarr;
					</Link>
				</div>

				{/* Title */}
				<h1 className="font-serif text-2xl font-bold tracking-wide text-neutral-950 uppercase sm:text-3xl">
					{isSignUp ? "Daftar Akun Baru" : "Selamat Datang"}
				</h1>
				<p className="mt-2 text-xs leading-relaxed text-neutral-500">
					{isSignUp
						? "Lengkapi identitas untuk bergabung dalam ekosistem katalog kurasi ekonomi kreatif."
						: "Masuk ke panel terkelola untuk mengelola produk dan hak akses."}
				</p>

				{/* Toggle Switch */}
				<div className="mt-6 flex rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-1">
					<button
						type="button"
						onClick={() => {
							setIsSignUp(false);
							setError("");
						}}
						className={`flex-1 rounded-md py-2 text-xs font-bold tracking-wider uppercase transition-all ${
							!isSignUp ? "bg-[#111111] text-white shadow-xs" : "text-neutral-500 hover:text-black"
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
						className={`flex-1 rounded-md py-2 text-xs font-bold tracking-wider uppercase transition-all ${
							isSignUp ? "bg-[#111111] text-white shadow-xs" : "text-neutral-500 hover:text-black"
						}`}
					>
						Daftar
					</button>
				</div>

				{/* Lockout Banner */}
				{lockoutSeconds > 0 && (
					<div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-amber-800">
						<ShieldAlert className="mt-0.5 size-4 shrink-0" />
						<div className="text-xs">
							<p className="font-bold">Proteksi Keamanan Aktif</p>
							<p className="mt-0.5 text-neutral-600">
								Terkunci karena brute-force guard. Sisa waktu: {lockoutSeconds} detik.
							</p>
						</div>
					</div>
				)}

				{/* Error Alert */}
				{error && lockoutSeconds === 0 && (
					<div className="mt-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-red-600">
						<ShieldAlert className="mt-0.5 size-4 shrink-0" />
						<p className="text-xs font-semibold leading-relaxed">{error}</p>
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					{isSignUp && (
						<div className="space-y-1">
							<label
								htmlFor="name"
								className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
							>
								Nama Lengkap
							</label>
							<div className="relative">
								<User className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
								<input
									id="name"
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. John Doe"
									required
									className="w-full rounded-lg border border-[#E5E2DC] bg-white py-2.5 pr-4 pl-10 text-xs font-medium text-neutral-900 placeholder-neutral-400 transition-all focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
								/>
							</div>
						</div>
					)}

					<div className="space-y-1">
						<label
							htmlFor="email"
							className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
						>
							Alamat Email
						</label>
						<div className="relative">
							<Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="admin@example.com"
								required
								className="w-full rounded-lg border border-[#E5E2DC] bg-white py-2.5 pr-4 pl-10 text-xs font-medium text-neutral-900 placeholder-neutral-400 transition-all focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
							/>
						</div>
					</div>

					<div className="space-y-1">
						<label
							htmlFor="password"
							className="text-xs font-bold text-neutral-800 uppercase tracking-wider"
						>
							Kata Sandi
						</label>
						<div className="relative">
							<Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••"
								required
								minLength={6}
								className="w-full rounded-lg border border-[#E5E2DC] bg-white py-2.5 pr-10 pl-10 text-xs font-medium text-neutral-900 placeholder-neutral-400 transition-all focus:border-black focus:ring-1 focus:ring-black focus:outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-black"
								tabIndex={-1}
							>
								{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
							</button>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || lockoutSeconds > 0}
						className="mt-6 flex w-full items-center justify-center gap-2 rounded-none bg-[#111111] py-3 text-xs font-bold tracking-wider !text-white text-white uppercase transition-all duration-300 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-lg shadow-sm disabled:opacity-50 [&_svg]:!text-white [&_svg]:text-white"
					>
						<span className="!text-white text-white">
							{loading ? "Memverifikasi..." : isSignUp ? "Daftar Akun" : "Masuk ke Akun"}
						</span>
						<ArrowRight className="size-3.5 !text-white text-white" />
					</button>
				</form>
			</div>
		</main>
	);
}
