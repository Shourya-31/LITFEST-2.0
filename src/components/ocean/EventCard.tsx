import { useState } from "react";
import type { FestEvent } from "@/data/events";
import { Pearl } from "./OceanDecor";

export function EventCard({ event }: { event: FestEvent }) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="glass group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-aqua/60 hover:shadow-glow">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary/80">
        {!imgError ? (
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_40%,var(--aqua),transparent_70%)] p-4 text-center opacity-70">
            <Pearl size={32} />
          </div>
        )}
      </div>
      <div className="p-3 text-center sm:p-4">
        <h3 className="font-display text-lg font-semibold text-pearl transition-colors group-hover:text-aqua sm:text-xl">
          {event.title}
        </h3>
      </div>
    </article>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
      <div className="flex gap-2">
        <Pearl size={10} />
        <Pearl size={16} />
        <Pearl size={10} />
      </div>
      <p className="font-display text-xl text-pearl">
        The tide hasn't brought anything here yet
      </p>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
