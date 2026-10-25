import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PirateWheelTimeline } from "../../frontend/src/features/schedule/PirateWheelTimeline";
import "../../frontend/src/styles/timeline.css";
import "../../frontend/src/features/schedule/components/OceanicTimelineBackdrop.css";
import "@/styles/feature-pages.css";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — LitFest: Blue Pulse" },
      {
        name: "description",
        content: "Explore the LitFest event schedule through an interactive 3D timeline.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700&family=Pirata+One&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const navigate = useNavigate();

  return (
    <main className="litfest-feature-page">
      <PirateWheelTimeline onNavigateHome={() => navigate({ to: "/" })} />
    </main>
  );
}
