# SuperBookmarks Presentation

## 1. Project Overview

SuperBookmarks is a usage-first dashboard for organizing links, applications, and server resources in one place.

It is built with:

- NestJS for the backend and routing
- MongoDB + Mongoose for persistence
- Handlebars for page rendering
- Vue 3 for dashboard interactivity
- SweetAlert2 for dialogs
- Font Awesome for compact icon-led actions
- Docker Compose for development and production-style execution

The project centralizes day-to-day resources and ranks them by actual usage instead of leaving them scattered across chat messages, browser bookmarks, notes, and terminal history.

## 2. What The Project Achieves

SuperBookmarks provides a single operational dashboard where a user can:

- Save URLs, local app launch targets, and server records
- Tag and group resources for faster filtering
- Pin favorites for one-click access
- Track usage through score history
- Import and export items as JSON with related tags and score data
- Manage application prefixes for APP-type entries
- Sign in through an in-app login dialog instead of relying on the browser auth prompt

In practical terms, it turns a static bookmark list into an active productivity dashboard.

## 3. Key Features

- Searchable dashboard with grid and list modes
- Compact top section with icon-based quick actions
- Compact item previews with click-to-reveal details
- Pinned favorites with type-aware actions
- URL items open directly
- APP items launch using configured prefixes
- SERVER items open details dialogs with copyable technical fields
- Score history per item
- Tag management and item CRUD flows
- Import/export bundle support for portability and backup
- Dialog-based sign-in with cookie-backed browser sessions
- Swagger documentation for backend APIs

## 4. What Problem It Solves For Humans

Humans usually manage work resources in fragmented places:

- browser bookmarks
- chat messages
- wiki pages
- local notes
- shell history
- ad hoc spreadsheets

That creates repeated friction:

- people forget useful links and internal tools
- access paths are slow to rediscover
- important resources are buried under unused ones
- teams rely on memory instead of structure
- server details get copied manually from scattered notes
- browser-level auth prompts can be awkward or unreliable in some setups

SuperBookmarks solves this by giving people:

- one consistent access point
- faster retrieval of high-value resources
- visibility based on actual usage
- easier onboarding for teammates
- less mental load when switching between tools and environments
- a cleaner sign-in experience inside the application UI

## 5. Development Mode

### Option A: Local Node.js Development

Install dependencies:

```bash
pnpm install
```

Start the app in watch mode:

```bash
pnpm start:dev
```

Requirements:

- a valid `.env` file
- MongoDB available through the configured `MONGO_URI`

Default local access:

- Dashboard: `http://localhost:3000/`
- Settings: `http://localhost:3000/settings`
- Swagger: `http://localhost:3000/docs`

Authentication behavior:

- browser users are redirected to `/auth/login`
- the app opens a login dialog for username and password
- successful login creates an auth cookie and returns the user to the requested page

### Option B: Docker Compose Development

Run the app and MongoDB together:

```bash
docker compose -f docker-compose.dev.yml up --build
```

What this does:

- starts MongoDB in a container
- runs the NestJS app in development mode
- mounts the project source into the container
- exposes the app on port `3000`
- supports the same dialog-based sign-in flow in the browser

## 6. Production Mode

Run the production-style stack:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

What this does:

- builds the application image from the project Dockerfile
- starts the application container
- starts a MongoDB container with persistent volume storage
- runs the application on port `3000`
- keeps services running in detached mode
- keeps the same login dialog flow for browser access

To stop the production stack:

```bash
docker compose -f docker-compose.prod.yml down
```

## 7. Why This Project Matters

SuperBookmarks is not just a bookmark manager.

It is a lightweight operational dashboard for people who work across:

- internal systems
- multiple environments
- technical tools
- support links
- app launch shortcuts
- infrastructure records

It reduces search time, lowers context-switching cost, and makes frequently used resources visible and actionable.

## 8. Suggested Demo Flow

If this presentation is used in a live demo, the simplest sequence is:

1. Show the login dialog and sign in flow
2. Show the dashboard top section, filters, and pinned favorites
3. Add a URL, APP, and SERVER item
4. Trigger a URL and an APP item
5. Open a server details dialog from pinned favorites
6. Show score history and the click-to-reveal item previews
7. Export the dashboard data as JSON
8. Re-import the same JSON bundle

## 9. Summary

SuperBookmarks helps humans organize operational knowledge into a searchable, secure, usage-aware dashboard.

Its value is simple:

- less time searching
- less duplicated knowledge
- faster access to important resources
- better daily workflow for technical users and teams
- a smoother browser login experience for protected internal tools