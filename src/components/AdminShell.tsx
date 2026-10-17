import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
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
			title: "Katalog Produk",
			href: "/products",
			icon: Package,
		},
		{
			title: "Manajemen Pengguna",
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
		<div className="relative flex min-h-[calc(100vh-4.5rem)] flex-col bg-[#F9F8F6] text-[#111111] md:flex-row antialiased">
			{/* Mobile Topbar */}
			<div className="flex items-center justify-between border-b border-[#E5E2DC] bg-white px-4 py-3 md:hidden">
				<button
					type="button"
					onClick={() => setMobileOpen(true)}
					className="flex size-9 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-800 hover:bg-neutral-100"
				>
					<Menu className="size-5" />
				</button>
				<span className="font-serif text-base font-black tracking-widest text-[#111111] uppercase">
					NORD &bull; {BRAND.short}
				</span>
				<div className="size-9" />
			</div>

			{/* Mobile Drawer Backdrop */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden"
					onClick={() => setMobileOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setMobileOpen(false);
					}}
					role="presentation"
				/>
			)}

			{/* Mobile Drawer */}
			<aside
				className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E5E2DC] bg-white p-5 shadow-2xl transition-transform duration-300 md:hidden ${
					mobileOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
					<div className="flex items-center gap-2">
						<span className="font-serif text-lg font-black tracking-widest text-[#111111] uppercase">
							NORD CONTROL
						</span>
					</div>
					<button
						type="button"
						onClick={() => setMobileOpen(false)}
						className="rounded-lg p-1 text-neutral-500 hover:text-black"
					>
						<X className="size-5" />
					</button>
				</div>

				<nav className="mt-6 flex-1 space-y-1.5">
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
								onClick={() => setMobileOpen(false)}
								className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
									active
										? "bg-[#111111] text-white shadow-xs"
										: "text-neutral-600 hover:bg-neutral-100 hover:text-black"
								}`}
							>
								<Icon className="size-4 shrink-0" />
								<span>{item.title}</span>
							</Link>
						);
					})}
				</nav>

				{/* Mobile Drawer User Footer */}
				<div className="border-t border-[#E5E2DC] pt-4">
					{session?.user && (
						<div className="mb-3 flex items-center gap-3 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-3">
							<div className="flex size-8 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">
								{session.user.name?.charAt(0).toUpperCase() || <User className="size-4" />}
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate text-xs font-bold text-neutral-900">{session.user.name}</p>
								<p className="truncate text-[11px] text-neutral-500">{session.user.email}</p>
							</div>
						</div>
					)}
					<button
						type="button"
						onClick={handleSignOut}
						className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100"
					>
						<LogOut className="size-3.5" />
						<span>Keluar Sesi</span>
					</button>
				</div>
			</aside>

			{/* Desktop Sidebar (Collapsible) */}
			<aside
				className={`relative z-20 hidden shrink-0 border-r border-[#E5E2DC] bg-white transition-all duration-300 md:flex md:flex-col ${
					collapsed ? "w-20 p-3" : "w-64 p-5"
				}`}
			>
				{/* Top Branding */}
				<div className="flex items-center justify-between border-b border-[#E5E2DC] pb-4">
					{!collapsed && (
						<div>
							<span className="font-serif text-sm font-black tracking-[0.2em] text-[#111111] uppercase block">
								NORD CONTROL
							</span>
							<span className="text-[9px] font-bold tracking-[0.25em] text-neutral-400 uppercase block">
								{BRAND.short} Atelier
							</span>
						</div>
					)}
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						title={collapsed ? "Buka Sidebar" : "Persempit Sidebar"}
						className={`flex size-8 items-center justify-center rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black ${
							collapsed ? "mx-auto" : ""
						}`}
					>
						{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
					</button>
				</div>

				{/* Nav Links */}
				<nav className="mt-6 flex-1 space-y-1.5">
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
								className={`group flex items-center gap-3 rounded-lg py-2.5 font-semibold transition-all ${
									collapsed ? "justify-center px-0" : "px-3.5 text-xs tracking-wide"
								} ${
									active
										? "bg-[#111111] text-white shadow-xs"
										: "text-neutral-600 hover:bg-neutral-100 hover:text-black"
								}`}
							>
								<Icon
									className={`size-4 shrink-0 transition-transform group-hover:scale-105 ${
										active ? "text-white" : "text-neutral-500"
									}`}
								/>
								{!collapsed && <span>{item.title}</span>}
							</Link>
						);
					})}
				</nav>

				{/* User Profile Footer */}
				<div className="border-t border-[#E5E2DC] pt-4">
					{!collapsed ? (
						<div className="space-y-3">
							{session?.user && (
								<div className="flex items-center gap-2.5 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] p-2.5">
									<div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#111111] text-xs font-bold text-white">
										{session.user.name?.charAt(0).toUpperCase() || <User className="size-3.5" />}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-xs font-bold text-neutral-900">
											{session.user.name || "Administrator"}
										</p>
										<p className="truncate text-[10px] text-neutral-500">{session.user.email}</p>
									</div>
								</div>
							)}
							<div className="flex items-center gap-2">
								<Link
									to="/"
									title="Buka Beranda"
									className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E2DC] bg-[#F9F8F6] py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-black"
								>
									<ExternalLink className="size-3" />
									<span>Beranda</span>
								</Link>
								<button
									type="button"
									onClick={handleSignOut}
									title="Keluar"
									className="flex size-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
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
							className="mx-auto flex size-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
						>
							<LogOut className="size-4" />
						</button>
					)}
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="relative z-10 flex flex-1 flex-col overflow-y-auto">
				{/* Top bar inside admin shell */}
				<header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E2DC] bg-white px-6 py-4 sm:px-8">
					<div>
						<h1 className="font-serif text-xl font-bold tracking-wide text-[#111111] uppercase sm:text-2xl">
							{title}
						</h1>
						{subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
					</div>
					{actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
				</header>

				{/* Page Body */}
				<main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
			</div>
		</div>
	);
}
