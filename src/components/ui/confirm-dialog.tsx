import { cn } from "cn";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "./button";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "default" | "destructive";
	loading?: boolean;
	onConfirm: () => void | Promise<void>;
}

/**
 * Accessible replacement for `window.confirm`.
 *
 * Focus trapping, escape handling and `aria-modal` semantics are provided by
 * Radix; the copy and destructive styling are ours.
 */
function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Konfirmasi",
	cancelLabel = "Batal",
	variant = "default",
	loading = false,
	onConfirm,
}: ConfirmDialogProps) {
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-[110] bg-black/45 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
				<DialogPrimitive.Content
					className={cn(
						"fixed top-1/2 left-1/2 z-[111] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-2xl outline-none",
						"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
						"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
					)}
				>
					<DialogPrimitive.Title className="display-title m-0 text-xl font-bold text-[var(--sea-ink)]">
						{title}
					</DialogPrimitive.Title>
					{description ? (
						<DialogPrimitive.Description className="mt-2 text-sm leading-6 text-[var(--sea-ink-soft)]">
							{description}
						</DialogPrimitive.Description>
					) : null}
					<div className="mt-6 flex justify-end gap-3">
						<DialogPrimitive.Close asChild>
							<Button type="button" variant="outline">
								{cancelLabel}
							</Button>
						</DialogPrimitive.Close>
						<Button
							type="button"
							variant={variant === "destructive" ? "destructive" : "default"}
							disabled={loading}
							onClick={() => void onConfirm()}
						>
							{loading ? "Memproses..." : confirmLabel}
						</Button>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export { ConfirmDialog };
