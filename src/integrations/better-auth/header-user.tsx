import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";
import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div className="size-7 animate-pulse rounded-full bg-white/10" />;
	}

	if (session?.user) {
		return (
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2 border-b border-white/20 pb-0.5">
					<div className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white">
						{session.user.name?.charAt(0).toUpperCase() || <User className="size-3" />}
					</div>
					<span className="max-w-[120px] truncate text-[11px] font-medium tracking-wider uppercase text-white/90">
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
					className="text-white/60 transition-colors hover:text-white"
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
			className="border border-white/30 bg-transparent px-4 py-1.5 text-[11px] font-medium tracking-[0.2em] uppercase text-white transition-all hover:bg-white hover:text-black"
		>
			Sign In
		</Link>
	);
}
