import { createFileRoute } from "@tanstack/react-router";
import { FaqSection } from "../../frontend/src/features/faq/FaqSection";
import "../../frontend/src/styles/faq.css";
import "@/styles/feature-pages.css";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — LitFest: Blue Pulse" },
      {
        name: "description",
        content: "Find event, registration, and logistics answers for LitFest at NIT Raipur.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700&family=Pirata+One&family=Space+Grotesk:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <main className="litfest-feature-page">
      <FaqSection />
    </main>
  );
}
