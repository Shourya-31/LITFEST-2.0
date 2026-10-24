import { useState, type ButtonHTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Variant = "pearl" | "ghost" | "chip";
const variants: Record<Variant, string> = {
  pearl: "bg-primary text-primary-foreground shadow-glow hover:brightness-110",
  ghost: "glass text-foreground hover:border-aqua/60",
  chip: "glass text-muted-foreground hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-glow",
};

export function RippleButton({
  variant = "pearl",
  className,
  onClick,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number; s: number }[]
  >([]);
  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const id = Date.now() + Math.random();
    setRipples((p) => [
      ...p,
      { id, x: e.clientX - r.left - s / 2, y: e.clientY - r.top - s / 2, s },
    ]);
    setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 700);
    onClick?.(e);
  };
  return (
    <button
      {...props}
      onClick={handle}
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variants[variant],
        className,
      )}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-span"
          style={{ left: r.x, top: r.y, width: r.s, height: r.s }}
        />
      ))}
      <span className="relative">{children}</span>
    </button>
  );
}
