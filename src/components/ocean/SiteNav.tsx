import { Link } from "@tanstack/react-router";
import { Pearl } from "./OceanDecor";

export function SiteNav() {
  const cls =
    "rounded-full px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-pearl whitespace-nowrap";
  return (
    <header className="glass sticky top-0 z-50 border-x-0 border-t-0 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 sm:gap-2 font-display text-lg sm:text-xl font-semibold text-pearl"
        >
          <Pearl size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>LitFest</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            className={cls}
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-pearl bg-secondary/80 shadow-sm" }}
          >
            Home
          </Link>
          <Link
            to="/events"
            className={cls}
            activeProps={{ className: "text-pearl bg-secondary/80 shadow-sm" }}
          >
            Events
          </Link>
          <Link
            to="/timeline"
            className={cls}
            activeProps={{ className: "text-pearl bg-secondary/80 shadow-sm" }}
          >
            Timeline
          </Link>
          <Link
            to="/faq"
            className={cls}
            activeProps={{ className: "text-pearl bg-secondary/80 shadow-sm" }}
          >
            FAQ
          </Link>
          <Link
            to="/team"
            className={cls}
            activeProps={{ className: "text-pearl bg-secondary/80 shadow-sm" }}
          >
            Our Team
          </Link>
        </div>
      </nav>
    </header>
  );
}
