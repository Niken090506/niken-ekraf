import { cn } from "cn";
import type * as React from "react";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			aria-hidden="true"
			className={cn("skeleton h-4 w-full rounded-md", className)}
			{...props}
		/>
	);
}

export { Skeleton };
