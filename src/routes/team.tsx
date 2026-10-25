import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { team, ROLE_ORDER, type TeamRole, type TeamMember } from "@/data/team";
import { TeamCard } from "@/components/ocean/TeamCard";
import { OceanScene, Pearl } from "@/components/ocean/OceanDecor";
import {
  ThreeDScrollContainer,
  type ThreeDSlide,
} from "@/components/ocean/ThreeDScrollContainer";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — LitFest: Blue Pulse" },
      {
        name: "description",
        content: "Meet the souls behind the stories of LitFest: Blue Pulse.",
      },
      { property: "og:title", content: "Our Team — LitFest: Blue Pulse" },
      {
        property: "og:description",
        content: "Meet the souls behind the stories of LitFest: Blue Pulse.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

const ROLE_DISPLAY_NAMES: Record<TeamRole, string> = {
  "Overall Coordinator": "Overall Coordinators",
  "Head Coordinator": "Head Coordinators",
  "Associate Coordinator": "Associate Coordinators",
  "Core Coordinator": "Core Coordinators",
  Coordinator: "Coordinators",
};

function TeamPage() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");

  const overallMembers = team.filter((m) => m.role === "Overall Coordinator");
  const headMembers = team.filter((m) => m.role === "Head Coordinator");
  const associateMembers = team.filter(
    (m) => m.role === "Associate Coordinator",
  );
  const coreMembers = team.filter((m) => m.role === "Core Coordinator");
  const coordinatorMembers = team.filter((m) => m.role === "Coordinator");

  const filteredTeam =
    selectedRoleFilter === "All"
      ? team
      : team.filter((m) => m.role === selectedRoleFilter);

  // Focus card helper
  const renderCard = (m: TeamMember) => (
    <TeamCard
      key={m.id}
      member={m}
      isFocused={hoveredId === m.id}
      isBlurred={hoveredId !== null && hoveredId !== m.id}
      onHover={() => setHoveredId(m.id)}
      onLeave={() => {
        if (hoveredId === m.id) setHoveredId(null);
      }}
      onSelect={() => setHoveredId(hoveredId === m.id ? null : m.id)}
    />
  );

  // Slide 1: Team Leadership (Overall Coordinators & Head Coordinators)
  const SlideLeadership = (
    <section className="relative flex h-full w-full flex-col overflow-hidden px-4 py-8 md:py-12">
      <OceanScene />
      <div
        className="scrollable-content relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-y-auto pr-1"
        onMouseLeave={() => setHoveredId(null)}
      >
        <div className="mb-8 text-center fade-up">
          <p className="mb-3 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] text-aqua">
            <Pearl size={8} /> LitFest Crew <Pearl size={8} />
          </p>
          <h1 className="font-display text-4xl font-semibold text-gradient-title sm:text-5xl md:text-6xl">
            The Souls Behind the Stories
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Hover or tap any card for the focus effect. Scroll to explore all
            tiers.
          </p>
        </div>

        {/* Section 1: Overall Coordinator */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-center gap-2 text-center">
            <Pearl size={10} />
            <h2 className="font-display text-2xl font-semibold text-pearl sm:text-3xl">
              Overall Coordinators
            </h2>
            <Pearl size={10} />
          </div>
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
            {overallMembers.map(renderCard)}
          </div>
        </div>

        {/* Section 2: Head Coordinators */}
        <div className="mb-14 pb-10">
          <div className="mb-4 flex items-center justify-center gap-2 text-center">
            <Pearl size={8} />
            <h2 className="font-display text-2xl font-semibold text-pearl sm:text-3xl">
              Head Coordinators
            </h2>
            <Pearl size={8} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {headMembers.map(renderCard)}
          </div>
        </div>
      </div>
    </section>
  );

  // Slide 2: Coordinators (Associate Coordinators, Core Coordinators, Coordinator)
  const SlideTeam = (
    <section className="relative flex h-full w-full flex-col overflow-hidden px-4 py-8 md:py-12">
      <OceanScene mermaid={false} />
      <div
        className="scrollable-content relative mx-auto flex h-full w-full max-w-6xl flex-col overflow-y-auto pr-1"
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Section 3: Associate Coordinators */}
        <div className="mb-10 pt-2">
          <div className="mb-4 flex items-center justify-center gap-2 text-center">
            <Pearl size={8} />
            <h2 className="font-display text-2xl font-semibold text-pearl sm:text-3xl">
              Associate Coordinators
            </h2>
            <Pearl size={8} />
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {associateMembers.map(renderCard)}
          </div>
        </div>

        {/* Section 4: Core Coordinators */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-center gap-2 text-center">
            <Pearl size={8} />
            <h2 className="font-display text-2xl font-semibold text-pearl sm:text-3xl">
              Core Coordinators
            </h2>
            <Pearl size={8} />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
            {coreMembers.map(renderCard)}
          </div>
        </div>

        {/* Section 5: Coordinator */}
        <div className="mb-16 pb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-center">
            <Pearl size={8} />
            <h2 className="font-display text-2xl font-semibold text-pearl sm:text-3xl">
              Coordinator
            </h2>
            <Pearl size={8} />
          </div>
          <div className="mx-auto max-w-sm">
            {coordinatorMembers.map(renderCard)}
          </div>
        </div>
      </div>
    </section>
  );

  const slides: ThreeDSlide[] = [
    {
      id: "team-leadership",
      label: "Leadership",
      depthName: "Overall & Heads",
      content: SlideLeadership,
    },
    {
      id: "team-coordinators",
      label: "Coordinators",
      depthName: "Associate, Core & Coordinator",
      content: SlideTeam,
    },
  ];

  return (
    <main className="relative min-h-[calc(100vh-57px)] w-full overflow-hidden">
      <ThreeDScrollContainer slides={slides} />
    </main>
  );
}
