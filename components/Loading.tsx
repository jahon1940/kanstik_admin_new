"use client";

type LoadingProps = {
	label?: string;
	size?: number; // px
};

export default function Loading({ label = "Yuklanmoqda...", size = 28 }: LoadingProps) {
	return (
		<div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
			<span
				className="inline-block animate-spin rounded-full border-2 border-foreground/30 border-t-foreground"
				style={{ width: size, height: size }}
			/>
			<span className="text-sm font-medium">{label}</span>
		</div>
	);
}


