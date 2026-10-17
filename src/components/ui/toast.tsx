import { cn } from "cn";
import { CheckCircle2, Info, type LucideIcon, TriangleAlert, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type * as React from "react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastOptions {
	title: string;
	description?: string;
	variant?: ToastVariant;
	/** Auto-dismiss delay in ms. Use 0 to keep the toast until dismissed. */
	duration?: number;
}

interface ToastItem {
	id: string;
	title: string;
	description?: string;
	variant: ToastVariant;
	duration: number;
}

interface ToastContextValue {
	toast: (options: ToastOptions) => string;
	dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<ToastVariant, { icon: LucideIcon; className: string }> = {
	success: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
	error: { icon: XCircle, className: "text-red-600 dark:text-red-400" },
	info: { icon: Info, className: "text-[var(--lagoon-deep)]" },
	warning: { icon: TriangleAlert, className: "text-amber-600 dark:text-amber-400" },
};

const MAX_VISIBLE = 4;

/**
 * Lightweight, dependency-free toast system.
 *
 * - Announced to screen readers through a polite, labelled live region.
 * - Rendered client-side only (toasts are triggered by user actions).
 * - Respects `prefers-reduced-motion` via the `toast-card` utility in styles.css.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((current) => current.filter((item) => item.id !== id));
	}, []);

	const toast = useCallback((options: ToastOptions) => {
		const id = crypto.randomUUID();
		const item: ToastItem = {
			id,
			title: options.title,
			description: options.description,
			variant: options.variant ?? "info",
			duration: options.duration ?? 5000,
		};
		setToasts((current) => [...current, item].slice(-MAX_VISIBLE));
		return id;
	}, []);

	const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<section
				aria-label="Notifikasi"
				aria-live="polite"
				aria-atomic="false"
				className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:top-0 sm:right-0 sm:bottom-auto sm:items-end"
			>
				{toasts.map((item) => (
					<ToastCard key={item.id} item={item} onDismiss={dismiss} />
				))}
			</section>
		</ToastContext.Provider>
	);
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
	useEffect(() => {
		if (item.duration <= 0) {
			return;
		}
		const timer = window.setTimeout(() => onDismiss(item.id), item.duration);
		return () => window.clearTimeout(timer);
	}, [item.id, item.duration, onDismiss]);

	const meta = VARIANT_META[item.variant];
	const Icon = meta.icon;

	return (
		<div
			data-slot="toast"
			data-variant={item.variant}
			className="toast-card pointer-events-auto w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
		>
			<div className="flex items-start gap-3">
				<Icon className={cn("mt-0.5 size-5 shrink-0", meta.className)} aria-hidden="true" />
				<div className="min-w-0 flex-1">
					<p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">{item.title}</p>
					{item.description ? (
						<p className="m-0 mt-1 text-xs leading-5 text-[var(--sea-ink-soft)]">
							{item.description}
						</p>
					) : null}
				</div>
				<button
					type="button"
					onClick={() => onDismiss(item.id)}
					aria-label="Tutup notifikasi"
					className="shrink-0 rounded-lg p-1 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					<X className="size-4" aria-hidden="true" />
				</button>
			</div>
		</div>
	);
}

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a <ToastProvider>");
	}
	return context;
}
