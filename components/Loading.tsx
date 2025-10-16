"use client";

type LoadingProps = {
  label?: string;
  size?: number; // px
};

export default function Loading({ label = "", size = 48 }: LoadingProps) {
  return (
    <div className="inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 min-h-[50vh]">
      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <span
          className="inline-block animate-spin rounded-full border-2 border-foreground/30 border-t-foreground"
          style={{ width: size, height: size }}
        />
        {label && <span className="text-sm font-medium">{label}</span>}
      </div>
    </div>
  );
}
