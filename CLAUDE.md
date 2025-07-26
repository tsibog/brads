# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Docs and details

Use Context7 MCP to fetch latest docs for various libraries and packages.

## Development Commands

**Start development server:**
I will have the server running always, no need to try to start it yourself.
**Build for production:**

```bash
npm run build
```

**Lint and format:**

```bash
npm run lint          # Run prettier and eslint checks
npm run format        # Format code with prettier
npm run check         # Run svelte-check for type checking
```

**Database operations:**

Use Turso MCP to do database operations.

## Project Architecture

This is a **SvelteKit 5** application for managing a board game catalog for Brads Spelcafé.

### Core Technologies

- **SvelteKit 5** - Full-stack framework with file-based routing
- **Drizzle ORM** - Type-safe database operations with SQLite/Turso
- **Lucia Auth** - Session-based authentication
- **Tailwind CSS 4** - Utility-first styling
- **BoardGameGeek API** - External data source for game information

### Database Schema

Located in `src/lib/server/db/schema.ts`:

- `users` - User accounts with admin privileges
- `sessions` - Lucia authentication sessions
- `boardGames` - Game data from BoardGameGeek API
- `gameComments` - User comments on games (requires approval)

### Authentication Flow

- Uses Lucia with Drizzle adapter (`src/lib/server/auth.ts`)
- Session handling in `src/hooks.server.ts`
- Admin routes protected under `/admin/`
- User data stored in `event.locals.user` and `event.locals.session`

### Key Routes Structure

- `/` - Redirects to `/browse`
- `/browse` - Public game browsing with filters
- `/game/[id]` - Individual game details
- `/admin/` - Protected admin area for managing games
- `/api/` - API endpoints for games, BGG search, comments

### BGG Integration

- `src/lib/fetchGames.ts` - Bulk game import utility
- `src/routes/api/bgg-search/+server.ts` - Real-time BGG search
- XML parsing using `@xmldom/xmldom` for BGG API responses
- Rate limiting with 666ms delays to respect BGG API

### Database Configuration

- Uses Turso (remote SQLite) in production via `drizzle.config.ts`
- Requires `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` environment variables
- Local SQLite database for development

### Component Organization

- `src/lib/components/` - Reusable Svelte components
- Server-side database operations in `+page.server.ts` files
- Client-side interactivity in `.svelte` components

### Development Notes

- Root page redirects to `/browse` - main functionality is there
- Admin features require authentication and admin privileges
- Game data is cached locally after BGG import
- Comments require admin approval before display

## Development Guidance

- I am always running the dev server myself so no need to try to start it

## Documentation Best Practices

- Keep specification documents (e.g., PARTY_FINDER_SPEC.md) clean and concise
  - Focus on architectural description of features
  - Serve as a reference for the codebase
- Separate implementation progress notes
  - Use dedicated files like PARTY_FINDER_PROGRESS.md for tracking implementation status
  - Progress documentation should be brief
  - List changed files and provide short rationale for changes
