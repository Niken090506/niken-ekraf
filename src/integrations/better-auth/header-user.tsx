import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div className="size-7 animate-pulse rounded-full bg-neutral-200" />;
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-2.5">
				<div className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1 shadow-xs">
					<div className="flex size-5 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
						{session.user.name?.charAt(0).toUpperCase() || <User className="size-3" />}
					</div>
					<span className="max-w-[120px] truncate text-[11px] font-medium tracking-wide text-neutral-900">
						{session.user.name || session.user.email}
					</span>
				</div>
				<button
					type="button"
					onClick={async () => {
						await authClient.signOut();
						navigate({ to: "/login" });
					}}
					title="Sign Out"
					className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-black"
				>
					<LogOut className="size-3.5" />
					<span className="sr-only">Sign out</span>
				</button>
			</div>
		);
	}

	return (
		<Link
			to="/login"
			className="rounded-none bg-[#111111] px-4 py-1.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-white transition-all hover:bg-neutral-800 shadow-xs"
		>
			Sign In
		</Link>
	);
}
