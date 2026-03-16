# Party Finder Integration Plan

## Summary

Build the Party Finder feature on top of the current master codebase (which has the Adventure Log, modern auth, admin tools). The old `feat/party-finder` branch has working code we can reference/port, but it uses deprecated Lucia auth that must be replaced with our modern auth system.

**Key decisions from owner:**
- Full profile system (bio, experience, play style, contact + privacy)
- 4-factor matching algorithm, Tue-Sun availability
- Integrate Adventure Log play data into matching
- Add `play_participants` table for structured player-to-play linking
- Separate `partyFinder` feature flag
- Login required to view party finder
- Full admin dashboard for party finder
- In-person cafe meetup focus (scheduling, not real-time)
- Experience: New / Some experience / Experienced
- Play style: Casual / Competitive / Either
- Extend registration form with party finder fields

---

## Phase 1: Database Schema Extensions

### 1.1 Add new columns to `users` table
- `display_name` (text, nullable)
- `bio` (text, nullable)
- `experience_level` (text, nullable) — values: 'new', 'some_experience', 'experienced'
- `play_style` (text, nullable) — values: 'casual', 'competitive', 'either'
- `looking_for_party` (boolean, default false)
- `party_status` (text, default 'resting') — values: 'active', 'resting'
- `open_to_any_game` (boolean, default false)
- `contact_method` (text, nullable) — values: 'email', 'phone', 'whatsapp', 'discord'
- `contact_value` (text, nullable)
- `contact_visible_to` (text, default 'matches') — values: 'none', 'matches', 'all'
- `last_login` (timestamp, nullable)

### 1.2 Create `user_availability` table
- `id` (integer, PK)
- `userId` (text, FK users.id, ON DELETE CASCADE)
- `dayOfWeek` (integer) — 0=Sun, 1=Mon, 2=Tue ... 6=Sat
- `createdAt` (timestamp)

### 1.3 Create `user_game_preferences` table
- `id` (integer, PK)
- `userId` (text, FK users.id, ON DELETE CASCADE)
- `gameBggId` (text, FK boardGames.bggId)
- `createdAt` (timestamp)

### 1.4 Create `system_settings` table
- `key` (text, PK)
- `value` (text, required)
- `description` (text, nullable)
- `updatedAt` (timestamp)

### 1.5 Create `play_participants` table (new — not in old branch)
- `id` (integer, PK)
- `playId` (integer, FK gamePlays.id, ON DELETE CASCADE)
- `userId` (text, FK users.id, ON DELETE CASCADE)
- `createdAt` (timestamp)

### 1.6 Add ON DELETE CASCADE to existing FK constraints
- `sessions.userId` → CASCADE
- `gamePlays.userId` → CASCADE

### 1.7 Generate Drizzle migration
- Single migration covering all schema changes

---

## Phase 2: Core Infrastructure

### 2.1 Party Finder utility module
Port `partyFinderUtils.ts` from old branch, adapted for modern auth:
- `calculatePlayerCompatibility()` — 4-factor scoring (40% availability, 40% games, 10% experience, 10% play style)
- `getActivePlayers()` — query active party finder users
- `getPlayerAvailability()` / `getPlayerGamePreferences()` — data fetching
- `reactivateUserIfAutoRested()` — called on login
- `getPlayHistory()` — NEW: query shared play history between users from `play_participants`
- Remove all Lucia references, use `locals.user` pattern from our auth
- Remove in-memory caching (unreliable on Vercel serverless) — rely on DB queries

### 2.2 Feature flag
Add `partyFinder` flag in `src/lib/flags.ts` alongside existing `logBook` flag.

### 2.3 Update login flow
- Add `last_login` timestamp update on successful login
- Add `reactivateUserIfAutoRested()` call on login
- Port from old branch's `login/+page.server.ts`, adapted to modern auth

### 2.4 Update `app.d.ts`
Extend `App.Locals.user` type to include new user columns.

---

## Phase 3: User Profile

### 3.1 Profile page (`/profile`)
Port from old branch, adapted for modern auth:
- **Load function:** Fetch user data + their availability + game preferences
- **Form actions:** Update profile fields, contact info, visibility settings
- **UI:** Form with sections for:
  - Display name, bio
  - Experience level (New / Some experience / Experienced)
  - Play style (Casual / Competitive / Either)
  - Contact method + value + visibility
  - Availability day selector (Tue-Sun)
  - Game preference selector (search + pick from catalog)
  - "Looking for party" toggle

### 3.2 Extend registration form
Port game selection and profile fields from old branch's registration:
- Add display name field (required)
- Add experience level picker (optional)
- Add play style picker (optional)
- Add contact method + value (optional)
- Add game preference selector — pick 1-4 games from catalog (optional)
- All party finder fields optional at registration (can complete on /profile later)

---

## Phase 4: Party Finder Page & API

### 4.1 API endpoints

**GET `/api/party-finder/players`**
- Paginated, filtered, sorted player list
- Calculates compatibility scores for current user
- Includes shared play history count from `play_participants`
- Filters: experience, play_style, availability_day, game_preference
- Requires auth
- Gated behind partyFinder feature flag

**POST `/api/party-finder/availability`**
- Update current user's day-of-week availability
- Delete old + insert new (replace strategy)
- Requires auth

**POST `/api/party-finder/game-preferences`**
- Update current user's preferred games
- Validate all bggIds exist in catalog
- Delete old + insert new
- Requires auth

**GET `/api/party-finder/games-search`**
- Search board_games by name for the game selector
- Returns bggId, name, thumbnail, player count info
- Requires auth

### 4.2 Party Finder page (`/party-finder`)
Port from old branch with auth rewrite:
- **Gated:** Feature flag + login required
- **Layout:** Sidebar (settings) + Main (player discovery table)
- **Sidebar:** PartyFinderSettings component (availability, games, toggles)
- **Main area:** Filterable, sortable, paginated player cards
- **Player cards show:**
  - Display name, experience, play style
  - Shared availability days (highlighted)
  - Preferred games (shared ones highlighted, with thumbnails)
  - Compatibility score (with "Great Match" badge at 75%+)
  - Shared play history ("You've played X games together")
  - Contact info (respecting privacy settings)

### 4.3 Svelte Components to create
Port and adapt from old branch:
- `PartyFinderSettings.svelte` — sidebar settings form
- `PartyFinderFilters.svelte` — filter dropdowns
- `PartyFinderPagination.svelte` — page navigation
- `PartyFinderStatusWarnings.svelte` — status alerts
- `PlayerDiscoveryTable.svelte` — player card list
- `DaySelector.svelte` — day-of-week picker (Tue-Sun)
- `GameSelector.svelte` — game search + selection

---

## Phase 5: Play Participants Integration

### 5.1 Update play logging to track participants
- When a play is logged with tagged players, insert records into `play_participants`
- Backfill: parse existing tagged player data from `gamePlays.notes` if feasible
- Update the plays API (`POST /api/plays`) to accept an array of participant user IDs

### 5.2 Surface shared history in party finder
- Query `play_participants` to find users who've played together
- Show on player cards: "Played together X times"
- Factor into matching algorithm as a bonus signal (not a core weight — more of a "you already know each other" indicator)

---

## Phase 6: Automated Systems

### 6.1 Inactive user cleanup cron
Port from old branch:
- `/api/cron/cleanup-inactive-users` endpoint
- Daily Vercel cron at 06:00 UTC (add to `vercel.json`)
- Inactivity based on MAX(last_login, latest play date) — whichever is more recent
- Configurable threshold via `system_settings`
- Auto-reactivation on login

### 6.2 System settings
- `party_finder_inactive_days` — default 14

---

## Phase 7: Admin Dashboard

### 7.1 Party Finder admin settings page
Port from old branch:
- `/admin/party-finder-settings` — configure inactive days threshold
- Manual trigger for cleanup cron

### 7.2 Party Finder admin analytics
New page or section within existing admin analytics:
- Total active party finder users
- Most popular availability days
- Most requested games
- Average compatibility score
- Users who've been auto-rested
- Party finder adoption rate (registered users vs. active in party finder)

### 7.3 Admin user management extension
- Add party finder status to existing `/admin/users` page
- Ability to manually deactivate/reactivate party finder profiles

---

## Phase 8: Navigation & Polish

### 8.1 Add to main navigation
- "Party Finder" link in header, next to Adventure Log
- Only visible when partyFinder feature flag is enabled
- Show for logged-in users only (since page requires auth)

### 8.2 Add admin nav link
- "Party Finder Settings" in admin sidebar

### 8.3 TODO.md note
- Add rate limiting note: login/register endpoints should have rate limiting (sveltekit-rate-limiter) — deferred to separate PR

---

## File Summary

### New files to create:
- `src/lib/server/partyFinderUtils.ts`
- `src/routes/party-finder/+page.server.ts`
- `src/routes/party-finder/+page.svelte`
- `src/routes/profile/+page.server.ts`
- `src/routes/profile/+page.svelte`
- `src/routes/api/party-finder/players/+server.ts`
- `src/routes/api/party-finder/availability/+server.ts`
- `src/routes/api/party-finder/game-preferences/+server.ts`
- `src/routes/api/party-finder/games-search/+server.ts`
- `src/routes/api/cron/cleanup-inactive-users/+server.ts`
- `src/routes/admin/party-finder-settings/+page.server.ts`
- `src/routes/admin/party-finder-settings/+page.svelte`
- `src/lib/components/PartyFinderSettings.svelte`
- `src/lib/components/PartyFinderFilters.svelte`
- `src/lib/components/PartyFinderPagination.svelte`
- `src/lib/components/PartyFinderStatusWarnings.svelte`
- `src/lib/components/PlayerDiscoveryTable.svelte`
- `src/lib/components/DaySelector.svelte`
- `src/lib/components/GameSelector.svelte`
- `drizzle/XXXX_party_finder.sql` (migration)

### Existing files to modify:
- `src/lib/server/db/schema.ts` — add tables + columns
- `src/lib/flags.ts` — add partyFinder flag
- `src/app.d.ts` — extend User type in Locals
- `src/routes/login/+page.server.ts` — add last_login + reactivation
- `src/routes/register/+page.server.ts` — add party finder fields
- `src/routes/register/+page.svelte` — add game selector + profile fields
- `src/routes/+layout.svelte` — add Party Finder nav link
- `src/routes/admin/+layout.svelte` — add admin nav link
- `src/routes/api/plays/+server.ts` — add participant tracking on play creation
- `vercel.json` — add cron schedule

### Files NOT being merged (building fresh instead):
We are NOT doing a git merge of `feat/party-finder`. We are porting the logic manually into the current codebase, rewriting auth, and adding new features (play_participants, play history integration, admin analytics). This avoids the 18-file merge conflict nightmare documented in PARTYFINDERMERGE.md.
