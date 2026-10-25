import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/ocean-hero.jpg";
import { QUEST_TIERS, QUEST_CONFIG, type QuestTier } from "@/data/events";
import { team, type TeamMember } from "@/data/team";
import { OceanScene, Pearl } from "@/components/ocean/OceanDecor";
import { TeamCard } from "@/components/ocean/TeamCard";
import {
  ThreeDScrollContainer,
  type ThreeDSlide,
} from "@/components/ocean/ThreeDScrollContainer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "LitFest — Blue Pulse: An Enchanted Underwater Literary World",
      },
      {
        name: "description",
        content:
          "LitFest: a literary festival beneath the waves. Explore events and meet the team.",
      },
      { property: "og:title", content: "LitFest — Blue Pulse" },
      {
        property: "og:description",
        content:
          "A literary festival beneath the waves. Explore events and meet the team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // Depth 0: Hero Surface
  const HeroSlide = (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 text-center">
      <img
        src={heroImg}
        alt=""
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover opacity-75"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      <OceanScene />
      <div className="relative max-w-2xl fade-up">
        <p className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-aqua">
          <Pearl size={8} /> LitFest <Pearl size={8} />
        </p>
        <h1 className="font-display text-5xl font-semibold leading-tight text-gradient-title md:text-7xl">
          Blue Pulse
        </h1>
        <p className="mt-4 text-muted-foreground md:text-lg">
          An enchanted underwater literary world.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/events"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110"
          >
            Explore Events
          </Link>
          <Link
            to="/team"
            className="glass rounded-full px-6 py-3 text-sm font-medium text-pearl transition hover:border-aqua/60"
          >
            Meet the Team
          </Link>
        </div>
        <p className="mt-10 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/80">
          <Pearl size={6} /> Scroll down to zoom in 3D <Pearl size={6} />
        </p>
      </div>
    </div>
  );

  // Depth 1: Events Preview (Single horizontal row of 4 compact cards including MUN)
  const EventsSlide = (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden px-4 py-8">
      <OceanScene mermaid={false} />
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-aqua">
            <Pearl size={8} /> Festival Quests <Pearl size={8} />
          </p>
          <h2 className="font-display text-4xl font-semibold text-pearl md:text-5xl">
            Dive Into Our Events
          </h2>
        </div>

        {/* Main Quests, Side Quests, Fun Quests, and MUN together in ONE horizontal row on desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {QUEST_TIERS.map((tier) => {
            const cfg = QUEST_CONFIG[tier];
            const isMun = tier === "MUN";

            if (isMun) {
              return (
                <a
                  key={tier}
                  href={cfg.link || "https://nitrrmun.in"}
                  target="_blank"
                  rel="noreferrer"
                  className="glass group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-aqua hover:shadow-glow sm:h-56 md:h-64"
                >
                  <img
                    src={cfg.image}
                    alt={cfg.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                  <div className="relative z-10 flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-pearl sm:text-2xl">
                      {cfg.name}
                    </h3>
                    <span className="text-sm font-medium text-aqua group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                      ↗
                    </span>
                  </div>
                </a>
              );
            }

            return (
              <Link
                key={tier}
                to="/events"
                className="glass group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-aqua hover:shadow-glow sm:h-56 md:h-64"
              >
                <img
                  src={cfg.image}
                  alt={cfg.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-display text-xl font-semibold text-pearl sm:text-2xl">
                    {cfg.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/events"
            className="glass inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-aqua shadow-glow transition hover:border-aqua hover:text-pearl"
          >
            <span>Explore All Events</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );

  // Depth 2: Team Preview (Focus Cards effect + Pixel Canvas)
  const TeamSlide = (
    <div
      className="relative flex h-full w-full flex-col justify-center overflow-hidden px-4 py-8"
      onMouseLeave={() => setHoveredTeamId(null)}
    >
      <OceanScene mermaid={false} />
      <div className="scrollable-content relative mx-auto flex h-full max-h-[85vh] w-full max-w-6xl flex-col overflow-y-auto pr-1">
        <div className="mb-6 text-center">
          <p className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-aqua">
            <Pearl size={8} /> Festival Leadership <Pearl size={8} />
          </p>
          <h2 className="font-display text-4xl font-semibold text-pearl md:text-5xl">
            Our Team
          </h2>
        </div>

        {/* Selected Coordinators in exact role order with Focus Card and Pixel Canvas effect */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {team.slice(0, 8).map((member: TeamMember) => (
            <TeamCard
              key={member.id}
              member={member}
              isFocused={hoveredTeamId === member.id}
              isBlurred={hoveredTeamId !== null && hoveredTeamId !== member.id}
              onHover={() => setHoveredTeamId(member.id)}
              onLeave={() => {
                if (hoveredTeamId === member.id) setHoveredTeamId(null);
              }}
              onSelect={() =>
                setHoveredTeamId(hoveredTeamId === member.id ? null : member.id)
              }
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center pb-6">
          <Link
            to="/team"
            className="glass inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-aqua shadow-glow transition hover:border-aqua hover:text-pearl"
          >
            <span>View All Coordinators</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );

  const slides: ThreeDSlide[] = [
    {
      id: "home-hero",
      label: "Home",
      depthName: "Surface",
      content: HeroSlide,
    },
    {
      id: "home-events",
      label: "Events",
      depthName: "Quests Row",
      content: EventsSlide,
    },
    {
      id: "home-team",
      label: "Our Team",
      depthName: "Coordinators",
      content: TeamSlide,
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-57px)] w-full overflow-hidden">
      <ThreeDScrollContainer
        slides={slides}
        initialIndex={slideIndex}
        onSlideChange={setSlideIndex}
      />
    </main>
  );
}
