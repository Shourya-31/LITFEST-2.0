import { useState } from "react";
import type { TeamMember } from "@/data/team";
import { Pearl } from "./OceanDecor";
import { PixelCanvas } from "./PixelCanvas";

const PARTICLES = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return { px: `${Math.cos(a) * 90}px`, py: `${Math.sin(a) * 90}px` };
});

interface TeamCardProps {
  member: TeamMember;
  active?: boolean;
  isFocused?: boolean;
  isBlurred?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}

export function TeamCard({
  member,
  active = false,
  isFocused = false,
  isBlurred = false,
  onSelect,
  onHover,
  onLeave,
}: TeamCardProps) {
  const [burst, setBurst] = useState(0);
  const initials = member.name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isCurrentActive = active || isFocused;

  return (
    <button
      type="button"
      aria-pressed={isCurrentActive}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => {
        onSelect?.();
        setBurst((b) => b + 1);
      }}
      className={`glass group relative flex h-full w-full flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl p-5 text-center transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isBlurred
          ? "scale-[0.97] opacity-40 blur-[2px] brightness-75"
          : isCurrentActive
            ? "scale-[1.03] border-aqua/80 shadow-glow"
            : "hover:-translate-y-1 hover:border-aqua/50 hover:shadow-glow"
      }`}
    >
      {/* Pixel Canvas Effect across the member's frame */}
      <PixelCanvas
        gap={8}
        speed={28}
        colors={["#e0f2fe", "#7dd3fc", "#0ea5e9", "#22d3ee", "#38bdf8"]}
        active={isCurrentActive}
        className="rounded-2xl"
      />

      {isCurrentActive && (
        <span
          key={`f${burst}`}
          aria-hidden
          className="pixel-frame pointer-events-none absolute -inset-1.5 rounded-xl border-4 border-dashed border-aqua [border-image:repeating-linear-gradient(90deg,var(--aqua)_0_8px,var(--pearl)_8px_12px,var(--accent)_12px_20px)_4] shadow-glow"
        />
      )}
      {burst > 0 && isCurrentActive && (
        <span
          key={`s${burst}`}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
          <span className="digital-sheen absolute inset-x-0 h-1/3 bg-[repeating-linear-gradient(0deg,transparent_0_3px,color-mix(in_oklab,var(--aqua)_35%,transparent)_3px_4px)]" />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="pearl pearl-particle absolute left-1/2 top-1/3 h-2 w-2"
              style={{
                ["--px" as string]: p.px,
                ["--py" as string]: p.py,
              }}
            />
          ))}
        </span>
      )}

      {/* Avatar Container */}
      <div className="relative z-10 mt-1 flex flex-col items-center">
        <div
          className={`relative h-24 w-24 overflow-hidden rounded-full p-1 transition-transform duration-300 [background:var(--gradient-pearl)] shadow-[var(--shadow-pearl)] ${
            isCurrentActive ? "scale-105" : "group-hover:scale-105"
          }`}
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              loading="lazy"
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary font-display text-2xl font-bold tracking-wider text-pearl">
              {initials}
            </div>
          )}
        </div>
      </div>

      {/* Name and Role */}
      <div className="relative z-10 flex w-full flex-1 flex-col justify-end">
        <h3 className="font-display text-xl font-semibold leading-tight text-pearl sm:text-2xl">
          {member.name}
        </h3>
        {member.role && (
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-aqua">
            <Pearl size={6} />
            <span>{member.role}</span>
          </p>
        )}
      </div>
    </button>
  );
}

interface FocusCardsProps {
  members: TeamMember[];
  className?: string;
}

export function FocusCards({ members, className = "" }: FocusCardsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}
      onMouseLeave={() => setHovered(null)}
    >
      {members.map((member) => (
        <div key={member.id} className="h-full">
          <TeamCard
            member={member}
            isFocused={hovered === member.id}
            isBlurred={hovered !== null && hovered !== member.id}
            onHover={() => setHovered(member.id)}
            onLeave={() => {
              if (hovered === member.id) setHovered(null);
            }}
            onSelect={() =>
              setHovered(hovered === member.id ? null : member.id)
            }
          />
        </div>
      ))}
    </div>
  );
}
