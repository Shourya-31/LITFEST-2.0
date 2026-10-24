import mermaidImg from "@/assets/mermaid.png";
import shipImg from "@/assets/ship.png";

const JELLY_COLORS: [string, string, string, string, string] = [
  "var(--aqua)",
  "var(--accent)",
  "var(--violet)",
  "var(--coral)",
  "var(--primary)",
];

export function Jellyfish({
  color,
  size = 70,
  className = "",
}: {
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Glowing jellyfish"
      className={`jellyfish pointer-events-auto absolute cursor-pointer rounded-full focus:outline-none ${className}`}
      style={{ width: size }}
    >
      <svg
        viewBox="0 0 100 140"
        className="jellyfish-body w-full"
        style={{ ["--jf" as string]: color }}
      >
        <defs>
          <radialGradient
            id={`jg-${size}-${color.length}`}
            cx="50%"
            cy="35%"
            r="65%"
          >
            <stop offset="0%" stopColor="var(--pearl)" stopOpacity="0.95" />
            <stop offset="55%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0.15" />
          </radialGradient>
        </defs>
        <path
          d="M10 55 C10 15 90 15 90 55 C80 60 70 52 60 58 C50 52 40 60 30 54 C22 60 15 56 10 55Z"
          fill={`url(#jg-${size}-${color.length})`}
        />
        {[22, 36, 50, 64, 78].map((x, i) => (
          <path
            key={x}
            d={`M${x} 56 q ${i % 2 ? 8 : -8} 20 0 40 q ${i % 2 ? -8 : 8} 20 0 40`}
            stroke={color}
            strokeOpacity="0.6"
            strokeWidth="2"
            fill="none"
          />
        ))}
      </svg>
    </button>
  );
}

export function Bubbles({ count = 16 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: count }).map((_, i) => {
        const size = 6 + ((i * 7) % 18);
        return (
          <span
            key={i}
            className="bubble absolute rounded-full border border-pearl/40 bg-pearl/10"
            style={{
              width: size,
              height: size,
              left: `${(i * 37) % 100}%`,
              bottom: -30,
              animationDelay: `${(i * 1.3) % 14}s`,
              ["--dur" as string]: `${10 + (i % 6) * 2}s`,
              ["--dx" as string]: `${(i % 2 ? 1 : -1) * (10 + (i % 5) * 8)}px`,
            }}
          />
        );
      })}
    </div>
  );
}

export function Ship({
  top,
  dur = 70,
  delay = 0,
  size = 90,
}: {
  top: string;
  dur?: number;
  delay?: number;
  size?: number;
}) {
  return (
    <div
      aria-hidden
      className="ship-drift pointer-events-none absolute left-0"
      style={{
        top,
        ["--dur" as string]: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <img
        src={shipImg}
        alt=""
        width={816}
        height={816}
        loading="lazy"
        className="ship-bob opacity-80"
        style={{ width: size, height: "auto" }}
      />
    </div>
  );
}

export function Mermaid({ className = "" }: { className?: string }) {
  return (
    <img
      src={mermaidImg}
      alt=""
      aria-hidden
      width={1024}
      height={1024}
      loading="lazy"
      className={`mermaid pointer-events-none absolute h-auto ${className}`}
    />
  );
}

export function Pearl({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pearl inline-block ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Full underwater scene layer for section backgrounds. */
export function OceanScene({ mermaid = true }: { mermaid?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <Bubbles />
      <Ship top="8%" dur={80} size={80} />
      <Ship top="55%" dur={110} delay={-50} size={60} />
      {mermaid && (
        <Mermaid className="right-[-4rem] top-[30%] w-48 opacity-70 md:w-72" />
      )}
      {mermaid && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-3rem] top-[58%] w-36 opacity-60 md:w-52"
          style={{ transform: "scaleX(-1)" }}
        >
          <Mermaid className="static h-auto w-full" />
        </div>
      )}
      <Jellyfish
        color={JELLY_COLORS[0]}
        className="left-[6%] top-[18%]"
        size={64}
      />
      <Jellyfish
        color={JELLY_COLORS[1]}
        className="left-[85%] top-[12%] hidden md:block"
        size={52}
      />
      <Jellyfish
        color={JELLY_COLORS[2]}
        className="left-[12%] top-[70%]"
        size={46}
      />
      <Jellyfish
        color={JELLY_COLORS[3]}
        className="left-[60%] top-[80%] hidden sm:block"
        size={40}
      />
      <Jellyfish
        color={JELLY_COLORS[4]}
        className="left-[38%] top-[38%] hidden md:block"
        size={44}
      />
      <Jellyfish
        color={JELLY_COLORS[2]}
        className="left-[74%] top-[45%] hidden lg:block"
        size={36}
      />
    </div>
  );
}
