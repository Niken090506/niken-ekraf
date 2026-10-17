import { TanStackDevtools } from "@tanstack/react-devtools";
import { HeadContent, Link, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Compass, RefreshCw, TriangleAlert } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { ToastProvider } from "../components/ui/toast";
import { BRAND } from "../lib/brand";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
	queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var resolved=mode==='auto'?'light':mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: `${BRAND.name} — ${BRAND.tagline}`,
			},
			{
				name: "description",
				content: BRAND.description,
			},
			{
				name: "theme-color",
				content: "#F9F8F6",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	shellComponent: RootDocument,
	errorComponent: RouteError,
	notFoundComponent: NotFound,
	pendingComponent: RoutePending,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: essential inline theme initialization to prevent flash */}
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased [overflow-wrap:anywhere]">
				<ToastProvider>
					<Header />
					{children}
					<Footer />
				</ToastProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

/**
 * Root error boundary. Catches render/data errors for every route so users
 * never see a blank screen or the default dev overlay in production.
 */
function RouteError({ error, reset }: { error: unknown; reset: () => void }) {
	const message =
		error instanceof Error && error.message
			? error.message
			: "Ada masalah saat memuat konten ini. Silakan coba lagi.";
	return (
		<main className="page-wrap px-4 py-16">
			<section className="island-shell rise-in mx-auto max-w-2xl rounded-2xl p-8 text-center sm:p-10">
				<div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-amber-600 dark:text-amber-400">
					<TriangleAlert className="size-8" aria-hidden="true" />
				</div>
				<p className="island-kicker mt-6 mb-2">Terjadi kesalahan</p>
				<h1 className="display-title m-0 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
					Halaman gagal dimuat
				</h1>
				<p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--sea-ink-soft)]">
					{message}
				</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<Button type="button" onClick={reset}>
						<RefreshCw className="size-4" aria-hidden="true" />
						Coba lagi
					</Button>
					<Button asChild variant="outline">
						<Link to="/">Kembali ke beranda</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}

/** Friendly 404 for unknown routes. */
function NotFound() {
	return (
		<main className="page-wrap px-4 py-16">
			<section className="island-shell rise-in mx-auto max-w-2xl rounded-2xl p-8 text-center sm:p-10">
				<div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--lagoon-deep)]">
					<Compass className="size-8" aria-hidden="true" />
				</div>
				<p className="island-kicker mt-6 mb-2">404</p>
				<h1 className="display-title m-0 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
					Halaman tidak ditemukan
				</h1>
				<p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--sea-ink-soft)]">
					Tautan yang kamu buka mungkin sudah dipindahkan atau tidak pernah ada.
				</p>
				<div className="mt-7 flex flex-wrap justify-center gap-3">
					<Button asChild>
						<Link to="/">Kembali ke beranda</Link>
					</Button>
					<Button asChild variant="outline">
						<Link to="/dashboard">Buka dashboard</Link>
					</Button>
				</div>
			</section>
		</main>
	);
}

/** Skeleton shown while a route's data is still loading. */
function RoutePending() {
	return (
		<main className="page-wrap px-4 py-12" aria-busy="true" aria-live="polite">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<Skeleton className="h-3 w-28" />
				<Skeleton className="mt-4 h-9 w-64 max-w-full" />
				<Skeleton className="mt-4 h-4 w-96 max-w-full" />
				<div className="mt-8 grid gap-4 sm:grid-cols-3">
					<Skeleton className="h-28 rounded-xl" />
					<Skeleton className="h-28 rounded-xl" />
					<Skeleton className="h-28 rounded-xl" />
				</div>
				<span className="sr-only">Memuat…</span>
			</section>
		</main>
	);
}
