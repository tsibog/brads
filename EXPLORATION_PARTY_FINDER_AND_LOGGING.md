# Exploration: Party Finder Branch & Game Play Logging

## Original Request (from cafe owner's letter)

> "A way for people to log plays - either as one account so that, as a community, we can see which games are being played the most from our shelves, or as individual profiles, people can set up and get some stats and data!"

The owner wants to know **which games from the cafe shelves are actually getting played**, and she wants that data visible both at the community level ("most played games") and at the individual level ("my play history / stats"). She also loves data in general — page views, usage patterns, etc.

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

1. **Game search component** — The `/api/party-finder/games-search` endpoint and game selector UI can be reused directly for "which game did you play?" selection when logging a play.

2. **Cron job pattern** — The daily cleanup cron can be adapted for weekly/monthly stats summaries or digest emails.

3. **`PartyFinderSettings.svelte` sidebar layout** — The sidebar+main layout pattern maps well to a logging interface (sidebar: log a play form, main: recent plays feed or stats).

4. **Filter/pagination components** — Already built for party finder, directly applicable to browsing play history.

### Needs to Be Built New

1. **`game_plays` table** — Core new table for logging plays:
   ```
   id, loggedById (FK users), gameBggId (FK boardGames.bggId),
   playDate, playerCount, duration (nullable, minutes),
   notes (nullable), createdAt
   ```

2. **Log a Play UI** — Form where a logged-in user picks a game from the cafe catalog, says how many people played, optionally adds notes. Should be quick and easy — the user just finished a game and wants to tap a few things.

3. **Community Stats Page** — The owner's core desire: "which games are being played the most from our shelves." Leaderboard of most-played games, recent plays feed, trends over time (weekly/monthly), busiest days.

4. **Personal Play History** — On the user's profile or a dedicated page: games they've logged, total plays, favorite games, play streaks. The "individual profiles with stats and data" from the request.

5. **Admin Stats Dashboard** — Aggregated data the owner would love: total plays logged, unique players, most popular games, play trends, which games never get played (shelf warmers).

---

## Potential Approach

### Option A: Individual Accounts (Recommended)

Each user logs their own plays under their existing account. This gives both the community view the owner wants AND personal stats.

- `/plays` — Community feed of recent plays + "most played" leaderboard
- `/plays/log` — Quick "log a play" form (pick game, player count, optional notes)
- `/plays/stats` — Community stats: most played, trends, busiest days
- `/profile` — Already exists, add a "my plays" section with personal stats

**Pros:** Richer data (who plays what), personal stats motivate users to log, integrates with existing accounts from party finder.
**Cons:** Requires users to have accounts, adoption depends on user engagement.

### Option B: Single Shared Account

One "cafe" account at the counter that anyone can use to log a play. Simpler, lower barrier.

- No individual attribution, just "Game X was played with N people on Date Y"
- Could be a tablet at the counter

**Pros:** Zero friction, no account needed, cafe staff can log plays too.
**Cons:** No personal stats, less data, no accountability (anyone could log nonsense).

### Option C: Both — Anonymous + Authenticated

Allow anonymous play logging (anyone can say "we played Game X") but authenticated users get their plays tracked on their profile too.

- Unauthenticated: simple form, logs the game + player count
- Authenticated: same form but also links to their profile, builds stats

**Pros:** Best of both worlds, lowest barrier for community data, rewards accounts with personal stats.
**Cons:** Slightly more complex, need to handle both flows.

### Recommendation

**Option A** is the cleanest starting point. The account system already exists from party finder, so there's no extra signup friction for users who are already registered. If adoption is a concern, Option C can be added later by making the `loggedById` field nullable — but starting with authenticated-only keeps the data clean and trustworthy.

---

## Key Considerations

- **The game catalog is already there** — The `board_games` table has all the cafe's games with names, images, player counts, categories, and mechanics. Play logging can link directly to this via `bggId`. The game search endpoint already exists.
- **The owner wants data** — She explicitly said "I love data." The stats/insights side of this feature is just as important as the logging form itself. Think: most played games leaderboard, play trends over time, "shelf warmers" report for games that never get played.
- **Two audiences for the data** — Community members want to see what's popular and track their own plays. The owner/admin wants operational insights (which games justify shelf space, what gets played on which days).
- **The party finder spec mentions "Group formation tools" as a future idea** — Play logging partially fulfills this: "these 4 people played Catan together last Wednesday."
- **The cron infrastructure exists** — Can be extended for weekly play summary digests or "this game hasn't been played in 3 months" alerts to the owner.
- **BGG integration opportunity** — BoardGameGeek itself has a play logging feature. There could be a future option to sync plays to BGG, but that's a stretch goal, not a launch requirement.

## Other Items from the Letter (Already Addressed)

The owner's letter also mentioned:
- **Games with different names / wrong images** — Admin can already edit games and add comments (e.g., Tausch Rausch example)
- **Manually adding games not on BGG** — Would need a manual game add form in admin (not yet built, but the schema supports it)
- **Language flags/indicators** — Not yet built; would be a column addition to `board_games` and a UI update on `/browse`
- **Usage analytics** — Separate from play logging; would need something like Plausible or a lightweight event tracking system

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
