import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

/**
 * Friendly, reusable empty state used across list and catalog pages so that
 * "no data yet" never renders as a bare table row.
 */
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				"flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--chip-bg)] px-6 py-12 text-center",
				className,
			)}
		>
			<div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--chip-line)] bg-[var(--surface-strong)] text-[var(--lagoon-deep)] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
				<Icon className="size-7" aria-hidden="true" />
			</div>
			<p className="m-0 text-base font-semibold text-[var(--sea-ink)]">{title}</p>
			{description ? (
				<p className="m-0 max-w-md text-sm leading-6 text-[var(--sea-ink-soft)]">{description}</p>
			) : null}
			{action ? <div className="mt-2">{action}</div> : null}
		</div>
	);
}

export { EmptyState };
