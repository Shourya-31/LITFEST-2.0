# LITFEST-2.0

Root architecture scaffold for the next LitFest website for Literati, NIT Raipur,
with initial sponsors and contact pages in the frontend.

> **Early development:** most directories remain architectural placeholders.
> The frontend currently contains runnable sponsors and contact pages; other planned
> application features, backend dependencies, database schemas, and deployment
> configuration have not been implemented.

## Repository structure

```text
.
├── .github/                 # Future repository automation and workflows
├── backend/
│   ├── src/
│   │   ├── api/v1/           # Versioned API entry points
│   │   ├── app/              # Server bootstrap
│   │   ├── config/           # Environment and application configuration
│   │   ├── database/         # Models, migrations, and seed locations
│   │   ├── middleware/       # Request middleware and error handling
│   │   ├── modules/          # Domain modules, including admin submodules
│   │   ├── observability/    # Logging and monitoring
│   │   ├── shared/           # Backend schemas and contracts
│   │   └── storage/          # Future media storage integration
│   └── tests/                # Unit and integration tests
├── docs/                     # Architecture, conventions, setup, and testing
├── frontend/
│   ├── public/               # Public static files
│   ├── src/
│   │   ├── app/              # Application bootstrap and routing
│   │   ├── assets/           # Source images, icons, and media
│   │   ├── components/       # Reusable UI, navigation, and feedback
│   │   ├── features/         # Public, participant, and admin feature areas
│   │   ├── hooks/            # Shared frontend hooks
│   │   ├── layouts/           # Public, participant, and admin layouts
│   │   ├── schemas/          # Frontend validation schemas
│   │   ├── services/         # API client and frontend services
│   │   ├── state/            # Shared application state
│   │   ├── styles/           # Global styles and theme tokens
│   │   ├── types/            # Frontend types
│   │   └── utils/            # Shared utilities, accessibility, and SEO
│   └── tests/                # Unit, integration, and end-to-end tests
├── infrastructure/           # Future container, proxy, and environment config
├── scripts/                  # Future setup, validation, and maintenance scripts
└── shared/                   # Cross-application contracts, types, and constants
```

Most planned directories are tracked using empty `.gitkeep` placeholders;
the frontend's sponsors page is an initial working feature.

## Planned feature areas

The frontend separates public festival content from participant and
administrative experiences:

- **Public festival:** home and about, events, speakers, schedule, sponsors,
  teams, gallery, announcements, FAQs, contact, and registration entry points.
- **Participants:** authentication, profile, event registrations, participation
  history, points, leaderboards, and notifications.
- **Administration:** analytics, participants, registrations, events, schedule,
  speakers, sponsors, teams, gallery, announcements, content, contact enquiries,
  scoring, settings, and audit-related functionality.

Backend modules reserve corresponding domain responsibilities, with common
contracts and types intended for `shared/` only when genuinely used by both
applications. The structure also reserves locations for API versioning,
validation, persistence, media storage, observability, and tests.

## Architecture and technology notes

The frontend currently uses React, TypeScript, and Vite for the sponsors and
contact pages. The contact page is available at `/contact`.
The previous LITERATI project also uses React Router on the frontend, and
Express with Mongoose on the backend. The backend, shared workspace tooling,
database schema, and deployment strategy are not configured yet. Existing
legacy paths and APIs have not been copied into this repository. Compatibility
should be considered when those are designed and implemented in future work.

See `docs/architecture/` for future architecture documentation and
`docs/development/` for future development setup guidance.

## Development status

The frontend pages are runnable from `frontend/` using `npm install` and
`npm run dev`. The rest of this repository primarily provides the planned
directory structure, and no test suite is configured yet. Implement features
incrementally in their designated areas, and add the necessary project
configuration as implementation proceeds.
