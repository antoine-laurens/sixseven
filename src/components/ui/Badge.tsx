"use client";

type BadgeVariant = "default" | "host" | "active" | "busted" | "stopped";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--bg-glass)] text-[var(--text-secondary)] border-[var(--border-subtle)]",
  host: "bg-[var(--accent-amber)]/10 text-[var(--accent-amber)] border-[var(--accent-amber)]/20",
  active:
    "bg-[var(--accent-purple)]/10 text-[var(--accent-purple-light)] border-[var(--accent-purple)]/20",
  busted:
    "bg-[var(--accent-red)]/10 text-[var(--accent-red)] border-[var(--accent-red)]/20",
  stopped:
    "bg-[var(--accent-emerald)]/10 text-[var(--accent-emerald)] border-[var(--accent-emerald)]/20",
};

export default function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5
        text-xs font-medium
        rounded-full
        border
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
