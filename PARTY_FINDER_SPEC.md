# Party Finder Feature Specification

## Overview

A completed community platform that extends the board game catalog, enabling users to find gaming partners at Brads Spelcafé based on availability, game preferences, and play style compatibility.

## Core User Stories

- **As a player**, I can register for an account and find others to play with
- **As a player**, I can set my availability (days) so others know when I'm free to play
- **As a player**, I can select preferred games and find compatible players
- **As a player**, I can specify my play style (casual/competitive) for better matching
- **As a player**, I can see other active players with smart match suggestions
- **As a player**, I can control my contact info visibility for privacy
- **As a player**, I am automatically set to "resting" when inactive and reactivated when I return
- **As an admin**, I can configure how long before inactive users are hidden

## Technical Architecture

### System Foundation

- **Framework**: SvelteKit 5 with file-based routing
- **Database**: Drizzle ORM with SQLite/Turso
- **Authentication**: Lucia authentication with dual login system (public `/login` and admin `/admin/login`)
- **Performance**: Multi-level memory-based caching (5-30min TTL) optimized for serverless
- **Infrastructure**: Vercel cron job for automated user cleanup

### Core Components

- **User Management**: Extended users table supports both admin and public accounts
- **Game Integration**: Links to existing boardGames catalog for preference selection
- **Matching Engine**: 4-factor algorithm with smart privacy controls
- **Contact System**: Flexible method selection (Email, Phone, WhatsApp, Discord)

## Database Schema

### 1. Extended users table

The existing `users` table includes these party finder columns:

```sql
-- Profile fields
display_name: text('display_name'), -- Public name shown to other players
bio: text('bio'), -- Optional user description
experience_level: text('experience_level'), -- 'beginner', 'intermediate', 'advanced'
vibe_preference: text('vibe_preference'), -- 'casual', 'competitive', 'both'

-- Party finder status
looking_for_party: integer('looking_for_party', { mode: 'boolean' }).default(false),
party_status: text('party_status').default('resting'), -- 'active', 'resting'
open_to_any_game: integer('open_to_any_game', { mode: 'boolean' }).default(false),

-- Contact & privacy (UPDATED: Flexible Contact Method System)
contact_method: text('contact_method'), -- 'email', 'phone', 'whatsapp', 'discord'
contact_value: text('contact_value'), -- The actual contact information
contact_visible_to: text('contact_visible_to').default('matches'), -- 'none', 'matches', 'all'

-- Activity tracking
last_login: integer('last_login', { mode: 'timestamp' })
```

### 2. Supporting tables

#### user_availability

```sql
export const userAvailability = sqliteTable('user_availability', {
  id: integer('id').primaryKey(),
  userId: text('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sunday, 1=Monday, etc.
  timeSlotStart: text('time_slot_start'), // Future: "09:00" format, nullable for now
  timeSlotEnd: text('time_slot_end'), // Future: "17:00" format, nullable for now
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow()
});
```

#### user_game_preferences

```sql
export const userGamePreferences = sqliteTable('user_game_preferences', {
  id: integer('id').primaryKey(),
  userId: text('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  gameBggId: text('game_bgg_id').notNull()
    .references(() => boardGames.bggId),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow()
});
```

#### system_settings

```sql
export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
});

// Default settings to insert:
// { key: 'party_finder_inactive_days', value: '14', description: 'Days before inactive users are hidden' }
```

## User States & Logic

### Party Finder Visibility Logic

A user appears in the Party Finder table when:

1. `looking_for_party = true` AND
2. `party_status = 'active'` AND
3. `last_login` is within admin-configured days (default: 14 days)

### Status Transitions

- **User toggles "Looking for Party"**: Updates `looking_for_party` boolean
- **User manually goes "Resting"**: Sets `party_status = 'resting'`
- **System auto-resting**: If `last_login` > configured days, system sets `party_status = 'resting'`
- **User logs back in**: If auto-rested, system sets `party_status = 'active'` (but `looking_for_party` remains user's choice)

## Feature Overview

The Party Finder is a completed community platform that transforms the board game catalog into a player matching system. Users can register, set availability preferences, select preferred games, and discover compatible gaming partners at Brads Spelcafé.

**Key Features**:

- Public user registration with game selection during signup
- Smart matching algorithm (4-factor scoring: availability, games, experience, vibe)
- Flexible contact method system (Email, Phone, WhatsApp, Discord)
- Privacy controls for contact information sharing
- Automatic inactive user management with admin-configurable thresholds
- Mobile-responsive interface with unified settings panel

## Security & Privacy Features

The system implements comprehensive security and privacy controls:

**Account Security**: Case-insensitive unique constraints, strong password requirements (8+ chars, mixed case, numbers), rate limiting (3 registration/hour, 5 login/15min per IP), no password reset functionality (intentional).

**Data Protection**: Contact information visibility controlled by user privacy settings, secure session handling, CSRF protection on all forms, input sanitization and XSS prevention.

**Operational Security**: Parameterized database queries, audit logging for key actions, admin moderation capabilities, rate limiting on all user actions.

**Future Enhancements**: OTP authentication, 2FA, email verification, secure account recovery.

## Core Features

### Player Discovery Pagination System

**Objective**: Server-side pagination for the party finder player table to handle hundreds of registered players efficiently while maintaining intelligent match scoring and sorting.

**Technical Implementation**:

1. **API Endpoint**: `GET /api/party-finder/players`
   - **Parameters**: `page` (default: 1), `limit` (default: 20), `sortBy` (default: compatibility), `sortOrder` (default: desc)
   - **Optional Filters**: `experience`, `vibe`, `availability_day`, `game_preference`
   - **Response Format**: `{ data: Player[], meta: { totalCount, page, limit, totalPages, averageCompatibility } }`

2. **Server-Side Match Calculation**:
   - Compatibility scoring algorithm moved from client to server
   - 4-factor scoring system: availability overlap (40%), game preferences (40%), experience level (10%), vibe compatibility (10%)
   - Calculate scores for ALL active players before pagination
   - Sort by compatibility score (highest first) before applying LIMIT/OFFSET
   - Include compatibility score in response data for each player

3. **Pagination Implementation**:
   - Default page size: 20 players
   - Mobile-responsive pagination controls (adapted from `/browse` implementation)
   - URL-based state management with `page` parameter
   - Smart page number generation with ellipsis for large datasets

4. **Performance Optimizations**:
   - Multi-level caching strategy (5-30min TTL) maintained
   - Cache compatibility calculations per user session
   - Database query optimization with proper indexing
   - Efficient sorting before pagination application

5. **Enhanced Features**:
   - Server-side filtering options integrated with pagination
   - Sorting options: compatibility score, display name, experience level, last login
   - "Show all matches above X% compatibility" option
   - Match statistics in pagination metadata

**Database Considerations**:

- Add indexes on filtered columns (`experience_level`, `vibe_preference`, `last_login`)
- Optimize user availability and game preference joins
- Consider materialized compatibility scores for frequent users

**Files Modified**:

- `src/routes/api/party-finder/players/+server.ts` (new) - Paginated API with match calculation
- `src/routes/party-finder/+page.server.ts` - Updated to use paginated API
- `src/routes/party-finder/+page.svelte` - Add pagination controls
- `src/lib/components/PlayerDiscoveryTable.svelte` - Remove client-side sorting, accept pre-calculated scores
- `src/lib/server/partyFinderUtils.ts` - Move compatibility calculation logic here

## Future Enhancement Ideas

- Time slot specificity (not just days)
- In-app messaging system
- Group formation tools (organizing specific game nights)
- Rating/feedback system for gaming experiences
- Integration with calendar systems
- Push notifications for new matches

## Development Reference

### Key System Components

- **Routes**: `/party-finder` (main interface), `/register`, `/login`, `/profile`
- **Admin**: `/admin/party-finder-settings` for configuration
- **API**: Endpoints under `/api/party-finder/` for preferences and matching
- **Utilities**: `src/lib/server/partyFinderUtils.ts` for core logic
- **Cron**: `/api/cron/cleanup-inactive-users` for automated maintenance

### Code Quality Standards

- Run `npm run lint` and `npm run check` after modifications
- Use `npm run studio` to inspect database changes
- Follow existing SvelteKit patterns and component structure
- Preserve backwards compatibility with admin features
- Leverage existing components and utilities where possible

### Security Implementation

The system implements comprehensive security measures:

- Case-insensitive unique constraints on username/email
- Strong password requirements with bcrypt hashing (12+ rounds)
- Rate limiting via `sveltekit-rate-limiter` for serverless compatibility
- Input sanitization and XSS prevention
- CSRF protection on all forms
- Parameterized queries with Drizzle ORM
- Secure session configuration with Lucia
- No password reset functionality (intentionally omitted for security)

## API Endpoints

The following API endpoints support the Party Finder functionality:

```
GET/POST /api/party-finder/preferences - User party finder settings management
GET /api/party-finder/players - Active players with compatibility scoring
POST /api/party-finder/contact-reveal - Contact information sharing
GET/POST /api/admin/party-finder-settings - Admin configuration interface
GET /api/cron/cleanup-inactive-users - Automated user status maintenance
```
