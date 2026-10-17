import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
	ShieldCheck,
	Sparkles,
	User,
	Users,
	X,
} from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { BRAND } from "@/lib/brand";

interface AdminShellProps {
	children: React.ReactNode;
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

export function AdminShell({ children, title, subtitle, actions }: AdminShellProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { data: session } = authClient.useSession();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const navItems = [
		{
			title: "Dashboard",
			href: "/dashboard",
			icon: LayoutDashboard,
		},
		{
			title: "Produk",
			href: "/products",
			icon: Package,
		},
		{
			title: "Pengguna",
			href: "/users",
			icon: Users,
		},
		{
			title: "Setup & Seed",
			href: "/setup",
			icon: Sparkles,
		},
	];

	const handleSignOut = async () => {
		await authClient.signOut();
		navigate({ to: "/login" });
	};

	return (
		<div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col bg-[#071519] md:flex-row">
			{/* Ambient Glowing Web3 Auroras */}
			<div
				className="pointer-events-none fixed top-1/4 left-1/3 size-[500px] rounded-full bg-teal-500/10 blur-[140px]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none fixed bottom-10 right-10 size-[400px] rounded-full bg-emerald-500/10 blur-[130px]"
				aria-hidden="true"
			/>

			{/* Mobile Topbar */}
			<div className="flex items-center justify-between border-b border-white/10 bg-[#071519]/90 px-4 py-3 backdrop-blur-xl md:hidden">
				<button
					type="button"
					onClick={() => setMobileOpen(true)}
					className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
				>
					<Menu className="size-5" />
				</button>
				<span className="font-serif text-lg font-bold tracking-wide text-teal-200">
					{BRAND.short} Admin
				</span>
				<div className="size-9" />
			</div>

			{/* Mobile Drawer Backdrop */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
					onClick={() => setMobileOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setMobileOpen(false);
					}}
					role="presentation"
				/>
			)}

			{/* Mobile Drawer */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#07171d] p-5 shadow-2xl transition-transform duration-300 md:hidden ${
					mobileOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between pb-6">
					<div className="flex items-center gap-2.5">
						<span className="size-2.5 rounded-full bg-teal-400" />
						<span className="font-serif text-lg font-bold text-white">{BRAND.short} Control</span>
					</div>
					<button
						type="button"
						onClick={() => setMobileOpen(false)}
						className="rounded-lg p-1 text-slate-400 hover:text-white"
					>
						<X className="size-5" />
					</button>
				</div>

				<nav className="flex-1 space-y-1.5">
					{navItems.map((item) => {
						const Icon = item.icon;
						const active = location.pathname === item.href;
						return (
							<Link
								key={item.href}
								to={item.href}
								onClick={() => setMobileOpen(false)}
								className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
									active
										? "border border-teal-500/30 bg-teal-500/15 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
										: "text-slate-400 hover:bg-white/5 hover:text-white"
								}`}
							>
								<Icon className="size-4 shrink-0" />
								<span>{item.title}</span>
							</Link>
						);
					})}
				</nav>

				{/* Mobile Drawer User Footer */}
				<div className="border-t border-white/10 pt-4">
					{session?.user && (
						<div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
							<div className="flex size-8 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-slate-950">
								{session.user.name?.charAt(0).toUpperCase() || <User className="size-4" />}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-xs font-semibold text-white">{session.user.name}</p>
								<p className="truncate text-[11px] text-slate-400">{session.user.email}</p>
							</div>
						</div>
					)}
					<button
						type="button"
						onClick={handleSignOut}
						className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
					>
						<LogOut className="size-3.5" />
						<span>Keluar Sesi</span>
					</button>
				</div>
			</aside>

			{/* Desktop Sidebar (Collapsible) */}
			<aside
				className={`relative z-20 hidden shrink-0 border-r border-white/10 bg-[#07161b]/95 backdrop-blur-2xl transition-all duration-300 md:flex md:flex-col ${
					collapsed ? "w-20 p-3" : "w-64 p-5"
				}`}
			>
				{/* Top Branding */}
				<div className="flex items-center justify-between pb-6">
					{!collapsed && (
						<div className="flex items-center gap-2.5">
							<span className="relative flex size-2.5">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-75" />
								<span className="relative inline-flex size-2.5 rounded-full bg-teal-400" />
							</span>
							<span className="font-serif text-base font-bold tracking-wider uppercase text-teal-200">
								{BRAND.short} Hub
							</span>
						</div>
					)}
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						title={collapsed ? "Buka Sidebar" : "Persempit Sidebar"}
						className={`flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white ${
							collapsed ? "mx-auto" : ""
						}`}
					>
						{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
					</button>
				</div>

				{/* Nav Links */}
				<nav className="flex-1 space-y-2">
					{navItems.map((item) => {
						const Icon = item.icon;
						const active =
							item.href === "/dashboard"
								? location.pathname === "/dashboard"
								: location.pathname.startsWith(item.href);
						return (
							<Link
								key={item.href}
								to={item.href}
								title={collapsed ? item.title : undefined}
								className={`group flex items-center gap-3 rounded-2xl py-2.5 font-medium transition-all ${
									collapsed ? "justify-center px-0" : "px-3.5 text-xs"
								} ${
									active
										? "border border-teal-500/30 bg-teal-500/15 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
										: "text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
								}`}
							>
								<Icon
									className={`size-4 shrink-0 transition-transform group-hover:scale-110 ${
										active ? "text-teal-300" : "text-slate-400"
									}`}
								/>
								{!collapsed && <span className="font-semibold">{item.title}</span>}
							</Link>
						);
					})}
				</nav>

				{/* User Profile Footer */}
				<div className="border-t border-white/10 pt-4">
					{!collapsed ? (
						<div className="space-y-3">
							{session?.user && (
								<div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 backdrop-blur-md">
									<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-slate-950">
										{session.user.name?.charAt(0).toUpperCase() || <User className="size-3.5" />}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs font-semibold text-slate-200">
											{session.user.name || "Administrator"}
										</p>
										<div className="mt-0.5 flex items-center gap-1 text-[10px] text-teal-400">
											<ShieldCheck className="size-3" />
											<span>Akun Terverifikasi</span>
										</div>
									</div>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Link
									to="/"
									title="Buka Beranda"
									className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
								>
									<ExternalLink className="size-3" />
									<span>Beranda</span>
								</Link>
								<button
									type="button"
									onClick={handleSignOut}
									title="Keluar"
									className="flex size-8 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
								>
									<LogOut className="size-3.5" />
								</button>
							</div>
						</div>
					) : (
						<button
							type="button"
							onClick={handleSignOut}
							title="Keluar"
							className="mx-auto flex size-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
						>
							<LogOut className="size-4" />
						</button>
					)}
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
				{/* Top bar inside admin shell */}
				<header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#07161b]/50 px-6 py-4 backdrop-blur-md sm:px-8">
					<div>
						<h1 className="font-serif text-2xl font-normal text-white sm:text-3xl">{title}</h1>
						{subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
					</div>
					{actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
				</header>

				{/* Page Body */}
				<main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
			</div>
		</div>
	);
}
