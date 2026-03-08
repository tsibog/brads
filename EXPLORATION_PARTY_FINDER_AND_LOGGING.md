# Exploration: Party Finder Branch & Play Logging System

## What Exists on `feat/party-finder`

The branch contains a fully built community platform on top of the game catalog. Here's what's there.

### Authentication & User System

- **Library:** Lucia Auth with Drizzle SQLite adapter
- **Password hashing:** Argon2id (via `oslo/password`)
- **Session handling:** Cookie-based sessions validated on every request in `hooks.server.ts`. Sets `event.locals.user` and `event.locals.session`.
- **Dual login:** Public `/login` (rate-limited: 5 attempts/15min per IP) and `/admin/login` (separate flow, no rate limiting)
- **Registration:** `/register` with rate limiting (3/hour per IP), collects username, password, display name, contact method, and 1-4 game preferences from the cafe catalog
- **Profile management:** `/profile` page for editing display name, bio, experience, play style, contact info, and visibility settings

### Database Tables (Drizzle ORM / SQLite)

| Table | Purpose |
|---|---|
| `users` | Accounts with profile, party status, contact info, activity tracking |
| `session` | Lucia session storage (id, userId, expiresAt) |
| `user_availability` | Day-of-week availability (0-6), has unused `timeSlotStart`/`timeSlotEnd` fields |
| `user_game_preferences` | Links users to preferred games (by bggId) |
| `system_settings` | Key-value config store (currently: inactive days threshold) |
| `board_games` | Existing game catalog |
| `gameComments` | Game comments with admin approval |

### Party Finder Feature

- **Main page** (`/party-finder`): Sidebar with settings + player discovery table
- **Matching algorithm** (in `partyFinderUtils.ts`): 4-factor scoring — availability overlap (40%), game preference overlap (40%), experience match (10%), vibe compatibility (10%)
- **Settings panel** (`PartyFinderSettings.svelte`): Day selector (Wed-Sun), game search/selection, "looking for party" toggle, "open to any game" toggle
- **Player cards**: Show display name, experience, play style, shared days, preferred games (shared ones highlighted), contact info (privacy-controlled)
- **Contact visibility**: User controls who sees their info — nobody, matches only (50%+ compatibility), or everyone
- **Filters**: By experience level, play style, available day, preferred game
- **Pagination**: Server-side, 20 per page

### Automated Systems

- **Vercel cron** (`/api/cron/cleanup-inactive-users`): Runs daily, sets inactive users to "resting"
- **Auto-reactivation**: Users who were auto-rested get reactivated on next login
- **Caching**: In-memory Map with TTL (5-30min depending on data type)

### API Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/party-finder/players` | Paginated player list with compatibility scores + filters |
| `POST /api/party-finder/availability` | Update day availability |
| `POST /api/party-finder/game-preferences` | Update game preferences |
| `GET /api/party-finder/games-search` | Search cafe catalog for game selection |
| `GET /api/cron/cleanup-inactive-users` | Automated inactive user cleanup |

---

## What Can Be Reused for a Play Logging System

### Fully Reusable (no changes needed)

1. **Auth system** — Lucia setup, hooks.server.ts session handling, login/register/logout flows, rate limiting. This is the foundation and it's solid.

2. **`users` table** — Already tracks `last_login`, has profile fields. The `party_status` field could double as a general activity indicator.

3. **`session` table** — Standard Lucia sessions, works as-is.

4. **`system_settings` table** — Generic key-value config, ready for logging system settings (e.g., max log entries per day, retention period).

5. **`user_game_preferences` table** — Users' preferred games. Useful for pre-populating "what did you play?" suggestions.

6. **Admin auth guard** (`/admin/+layout.server.ts`) — Already protects admin routes.

7. **Component patterns** — DaySelector, game search, filter/pagination, sidebar+main layout.

### Reusable with Minor Adaptation

1. **`user_availability` table** — Currently stores which days a user is free. For logging, this could serve a dual purpose: both "when I'm usually here" and as context for the logging system. The unused `timeSlotStart`/`timeSlotEnd` fields could finally be put to use for logging time ranges.

2. **Cron job pattern** — The daily cleanup cron can be adapted for log retention, weekly summaries, or attendance streak tracking.

3. **Matching algorithm** — Could be repurposed to suggest "people who were here the same days as you" or "people who play the same games."

4. **`PartyFinderSettings.svelte` sidebar** — The layout pattern (sidebar settings + main content) maps well to a logging interface (sidebar: log entry form, main: history/feed).

### Needs to Be Built New

1. **`play_logs` table** — Core new table:
   ```
   id, visitorId (FK users), gameId (FK boardGames.bggId nullable),
   visitDate, arrivalTime, departureTime (nullable),
   playerCount, notes, createdAt
   ```

2. **Log entry UI** — A page where authenticated users can log that they visited, optionally what they played, with whom, etc.

3. **Public/admin log views** — "Who's at the cafe today?", historical visit logs, admin reports.

4. **Stats/insights** — Visit frequency, most played games, busiest days, personal streaks.

---

## Potential Approach

### Option A: Build Logging as a Separate Feature, Same Auth

Keep party finder and play logging as independent features that share the auth system and user table. This is the simplest path — no refactoring needed, just add new routes and a new table.

- `/log` — Log a visit / what you played
- `/activity` — Public feed of recent visits
- `/profile` — Already exists, add a "my visits" tab

### Option B: Merge Into a Unified "Community" System

Refactor party finder into a broader community platform. The play log becomes another facet of a user's profile alongside their availability and preferences.

- Requires restructuring routes (e.g., `/community/find-players`, `/community/log`, `/community/activity`)
- More cohesive UX, but more refactoring work
- Makes sense if both features launch together

### Recommended: Option A

The auth system is already cleanly separated. Adding logging alongside party finder (not inside it) avoids refactoring risk and lets each feature ship independently. The shared user/session system is the glue — everything else can be additive.

---

## Key Considerations

- **The `user_availability` table has unused time slot fields** — These were designed for future use and could serve play logging naturally (when did they arrive/leave).
- **The party finder spec mentions "Group formation tools" and "Rating/feedback system" as future ideas** — A play log partially fulfills both of these.
- **Contact system is flexible** — Already supports email, phone, WhatsApp, Discord. No changes needed for logging.
- **The cron infrastructure exists** — Can be extended for log-related automated tasks (weekly summaries, streak notifications).
- **No password reset exists intentionally** — The spec notes this as a deliberate security choice. Worth revisiting if the user base grows with play logging.

---

## Files of Interest on `feat/party-finder`

| File | What It Does |
|---|---|
| `src/lib/server/auth.ts` | Lucia auth instance setup |
| `src/lib/server/db/schema.ts` | All DB table definitions |
| `src/lib/server/partyFinderUtils.ts` | Matching algorithm, auto-rest logic, caching |
| `src/hooks.server.ts` | Session validation on every request |
| `src/routes/login/` | Public login page + server action |
| `src/routes/register/` | Registration with game selection |
| `src/routes/profile/` | User profile editing |
| `src/routes/party-finder/` | Main party finder page + settings |
| `src/routes/api/party-finder/` | All party finder API endpoints |
| `src/routes/api/cron/` | Automated cleanup cron endpoint |
| `src/routes/admin/party-finder-settings/` | Admin config for inactive threshold |
| `PARTY_FINDER_SPEC.md` | Full feature specification |
