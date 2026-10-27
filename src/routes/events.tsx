import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/ocean-hero.jpg";
import {
  events,
  QUEST_TIERS,
  QUEST_CONFIG,
  type QuestTier,
} from "@/data/events";
import { EventCard, EmptyState } from "@/components/ocean/EventCard";
import { OceanScene, Pearl } from "@/components/ocean/OceanDecor";
import {
  ThreeDScrollContainer,
  type ThreeDSlide,
} from "@/components/ocean/ThreeDScrollContainer";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — LitFest: Blue Pulse" },
      {
        name: "description",
        content:
          "Dive into LitFest's literary, cultural, competition and workshop events.",
      },
      { property: "og:title", content: "Events — LitFest: Blue Pulse" },
      {
        property: "og:description",
        content:
          "Dive into LitFest's literary, cultural, competition and workshop events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const [openQuest, setOpenQuest] = useState<QuestTier>("Main Quest");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const activeEvents = events.filter((e) => e.quest === openQuest);

  // Slide 1: Hero Section
  const HeroSlide = (
    <section className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 text-center">
      <img
        src={heroImg}
        alt=""
        width={1920}
        height={1088}
        onError={() => setImgErrors((prev) => ({ ...prev, hero: true }))}
        className="absolute inset-0 h-full w-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
      <OceanScene />
      <div className="relative max-w-2xl fade-up">
        <p className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-aqua">
          <Pearl size={8} /> Blue Pulse <Pearl size={8} />
        </p>
        <h1 className="font-display text-5xl font-semibold leading-tight text-gradient-title md:text-7xl">
          Dive Into Our Events
        </h1>
        <p className="mt-5 text-muted-foreground md:text-lg">
          Readings, performances, contests and games drifting up from the deep.
        </p>
        <div className="mt-8 flex justify-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-aqua/40 bg-secondary/60 px-5 py-2 text-xs uppercase tracking-[0.2em] text-aqua shadow-glow">
            <Pearl size={8} /> Scroll down to zoom into the quests
          </p>
        </div>
      </div>
    </section>
  );

  // Slide 2: Quests in a single horizontal row on desktop + revealed event cards
  const QuestsSlide = (
    <section className="relative flex h-full w-full flex-col overflow-hidden px-4 py-8 md:py-12">
      <OceanScene mermaid={false} />
      <div className="scrollable-content relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-y-auto pr-1">
        <div className="mb-6 text-center">
          <p className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-aqua">
            <Pearl size={8} /> Quests & Competitions <Pearl size={8} />
          </p>
          <h2 className="font-display text-3xl font-semibold text-pearl sm:text-4xl">
            Choose Your Quest
          </h2>
        </div>

        {/* Main Quests, Side Quests, Fun Quests, and MUN together in ONE horizontal row on desktop */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {QUEST_TIERS.map((tier) => {
              const cfg = QUEST_CONFIG[tier];
              const isSelected = openQuest === tier;
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
                    {!imgErrors[tier] ? (
                      <img
                        src={cfg.image}
                        alt={cfg.name}
                        loading="lazy"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [tier]: true }))
                        }
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-secondary" />
                    )}
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
                <button
                  key={tier}
                  type="button"
                  onClick={() => setOpenQuest(tier)}
                  aria-pressed={isSelected}
                  className={`glass group relative flex h-48 flex-col justify-end overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 sm:h-56 md:h-64 ${
                    isSelected
                      ? "border-aqua ring-2 ring-aqua/80 shadow-glow scale-[1.02]"
                      : "hover:-translate-y-1 hover:border-aqua/50 hover:shadow-glow"
                  }`}
                >
                  {!imgErrors[tier] ? (
                    <img
                      src={cfg.image}
                      alt={cfg.name}
                      loading="lazy"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [tier]: true }))
                      }
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-secondary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />

                  <div className="relative z-10">
                    <h3 className="font-display text-xl font-semibold text-pearl sm:text-2xl">
                      {cfg.name}
                    </h3>
                  </div>

                  {/* Active bottom triangle indicator */}
                  {isSelected && (
                    <div
                      aria-hidden
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 border-x-8 border-b-8 border-x-transparent border-b-aqua"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Revealed Active Quest Events: Clean compact cards with ONLY event names and images */}
        <div className="flex-1 pb-16">
          <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
            <Pearl size={10} />
            <h4 className="font-display text-2xl font-semibold text-pearl">
              {QUEST_CONFIG[openQuest].name}
            </h4>
          </div>

          {activeEvents.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {activeEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          ) : (
            <EmptyState text="New events will surface soon — check back shortly." />
          )}
        </div>
      </div>
    </section>
  );

  const slides: ThreeDSlide[] = [
    {
      id: "events-hero",
      label: "Overview",
      depthName: "Surface",
      content: HeroSlide,
    },
    {
      id: "events-quests",
      label: "Quests",
      depthName: "Events Row",
      content: QuestsSlide,
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-57px)] w-full overflow-hidden">
      <ThreeDScrollContainer slides={slides} />
    </main>
  );
}
