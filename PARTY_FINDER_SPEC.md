# Party Finder Feature Specification

## Overview

Transform the board game catalog into a community platform where users can find gaming partners at Brads Spelcafé based on availability, game preferences, and play style compatibility.

## Core User Stories

- **As a player**, I want to register for an account so I can find others to play with
- **As a player**, I want to set my availability (days) so others know when I'm free to play
- **As a player**, I want to select preferred games so I can find compatible players
- **As a player**, I want to specify my play style (casual/competitive) for better matching
- **As a player**, I want to see other active players with smart match suggestions
- **As a player**, I want to control my contact info visibility for privacy
- **As a player**, I want to manually go "resting" when I'm not looking for games
- **As an admin**, I want to configure how long before inactive users are hidden

## Technical Architecture Context

### Current System (to build upon)

- **Framework**: SvelteKit 5 with file-based routing
- **Database**: Drizzle ORM with SQLite/Turso
- **Auth**: Lucia authentication with sessions
- **Current users table**: Admin-only accounts with username/password/email

### Integration Points

- Extend existing auth system for regular user registration
- Leverage existing boardGames table for game preferences
- Build on existing admin management patterns

## Database Schema Changes

### 1. Extend users table

Add these columns to existing `users` table:

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

### 2. New tables

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

## Implementation Phases

> **Progress Tracking**: See [PARTY_FINDER_PROGRESS.md](./PARTY_FINDER_PROGRESS.md) for current implementation status

### Phase 1: Database & Auth Foundation

**Acceptance Criteria**: Database migrations run successfully, auth system extended

**Steps**:

1. Create and run database migration adding new columns to `users` table
2. Create and run migrations for new tables: `userAvailability`, `userGamePreferences`, `systemSettings`
3. Insert default system settings
4. Update Lucia auth config to include new user attributes (display_name, etc.)
5. Update TypeScript types for User, Session

**Files to modify**:

- `src/lib/server/db/schema.ts` - Add new schema definitions
- `src/lib/server/auth.ts` - Update getUserAttributes
- `drizzle/` - Create migration files
- Run `npm run db:generate` and `npm run db:migrate`

### Phase 2: User Registration & Authentication

**Acceptance Criteria**: Regular users can register, login, logout with robust validation

**Steps**:

1. Create `/register` route with form (username, email, password, display_name)
2. Create registration server action with comprehensive validation:
   - Check for duplicate usernames (case-insensitive)
   - Check for duplicate emails (case-insensitive)
   - Validate email format using proper regex
   - Enforce strong password requirements (min 8 chars, mixed case, numbers)
   - Sanitize all input fields
   - Serverless rate limiting: Registration (3/hour per IP), Login (5/15min per IP)
3. Create separate `/login` route for public users (keep `/admin/login` for admins)
4. Create user profile page `/profile` for editing personal info
5. Add navigation items for login/logout/profile
6. Update session handling to track `last_login` for public users
7. **Important**: No password reset functionality initially (future: OTP solution)
8. **Serverless**: Use `sveltekit-rate-limiter` for Vercel-compatible rate limiting

**Files to create/modify**:

- `src/routes/register/+page.svelte` - Registration form
- `src/routes/register/+page.server.ts` - Registration logic with rate limiting
- `src/routes/login/+page.svelte` - Public user login form (separate from admin)
- `src/routes/login/+page.server.ts` - Public login logic with rate limiting
- `src/routes/profile/+page.svelte` - Profile management
- `src/routes/profile/+page.server.ts` - Profile update logic
- `src/routes/+layout.svelte` - Add public auth navigation items
- `src/hooks.server.ts` - Update last_login tracking for public users
- Package: Install `sveltekit-rate-limiter` for serverless rate limiting

### Phase 3: Core Party Finder Interface

**Acceptance Criteria**: Users can set party finder preferences and see other players

**Steps**:

1. Create `/party-finder` route with toggle for "Looking for Party"
2. Add day selection interface (Mon-Sun checkboxes)
3. Add game preferences with search/autocomplete from existing catalog
4. Add vibe preference selection (Casual/Competitive/Both)
5. Add "Open to any game" toggle
6. Add manual "Resting" toggle
7. Create player discovery table showing active users
8. Implement basic filtering (by days, games, experience level)

**Files to create**:

- `src/routes/party-finder/+page.svelte` - Main party finder interface
- `src/routes/party-finder/+page.server.ts` - Load user preferences and active players
- `src/lib/components/PartyFinderSettings.svelte` - Settings form component
- `src/lib/components/PlayerDiscoveryTable.svelte` - Active players table
- `src/lib/components/GameSelector.svelte` - Game preference selector
- API endpoints for updating preferences

### Phase 4: Matching Algorithm & Contact System

**Acceptance Criteria**: Smart matching highlights compatible players, contact sharing works

**Steps**:

1. Implement matching algorithm scoring overlapping days + shared games + compatible vibe
2. Add "Great Matches" highlighting in player table
3. Implement contact sharing system with privacy controls
4. Add compatibility score display
5. Create admin settings page for configuring inactivity period
6. Implement automatic "resting" for inactive users
7. Add simple caching for match results (5-10 minute cache)

**Files to create/modify**:

- `src/lib/server/matching.ts` - Matching algorithm logic
- `src/lib/server/privacy.ts` - Contact sharing logic
- `src/routes/admin/party-finder-settings/+page.svelte` - Admin configuration
- `src/routes/api/party-finder/matches/+server.ts` - Matching API
- Update PlayerDiscoveryTable with matching indicators

### Phase 5: UI Polish & Features

**Acceptance Criteria**: Professional UI, mobile responsive, activity indicators

**Steps**:

1. Add navigation link to Party Finder in main layout
2. Implement responsive design for mobile devices
3. Add activity indicators (last seen, recently active)
4. Polish forms with proper validation and error handling
5. Add loading states and optimistic updates
6. Implement contact reveal workflow
7. Add confirmation dialogs for status changes

**Files to modify**:

- All UI components for responsive design
- Add loading and error states
- Polish CSS and interactions

## Testing Checklist

### Phase 1 Testing

- [ ] Database migrations run without errors
- [ ] New tables created with correct schema
- [ ] Auth system includes new user attributes
- [ ] No breaking changes to existing functionality

### Phase 2 Testing ✅ COMPLETED

- [x] User can register with valid email/username/password
- [x] Registration prevents duplicate usernames (case-insensitive)
- [x] Registration prevents duplicate emails (case-insensitive)
- [x] Registration rejects weak passwords (test various invalid formats)
- [x] Registration rate limiting works (test multiple rapid attempts)
- [x] Registration sanitizes input (test XSS attempts)
- [x] Registration form shows clear validation errors
- [x] User can login and logout
- [x] Profile page loads and allows editing
- [x] Last login timestamp updates correctly
- [x] Admin login still works (backwards compatibility)
- [x] No password reset functionality available (intentionally omitted)

### Phase 3 Testing

- [ ] Party finder page loads for authenticated users
- [ ] User can toggle "Looking for Party" status
- [ ] Day selection works (multiple days can be selected)
- [ ] Game preferences can be added/removed
- [ ] Vibe preference can be set
- [ ] Player discovery table shows other active users
- [ ] Filtering works correctly

### Phase 4 Testing

- [ ] Matching algorithm correctly identifies compatible players
- [ ] "Great Matches" are highlighted appropriately
- [ ] Contact sharing respects privacy settings
- [ ] Admin can configure inactivity period
- [ ] Inactive users are automatically hidden
- [ ] Users auto-return to active when logging back in

### Phase 5 Testing

- [ ] Interface works on mobile devices
- [ ] Navigation is intuitive
- [ ] Forms provide clear feedback
- [ ] Contact reveal workflow is smooth
- [ ] No console errors or broken functionality

## Security & Privacy Considerations

### User Registration & Account Security

1. **Duplicate Prevention**: Enforce unique usernames and emails (case-insensitive checks)
2. **Strong Passwords**: Minimum 8 characters with mixed case, numbers, and special characters
3. **Rate Limiting**: Limit registration attempts (3 per IP per hour) and login attempts (5 per IP per 15 minutes)
4. **Input Sanitization**: All user inputs sanitized to prevent XSS, SQL injection, and other attacks
5. **Email Validation**: Proper email format validation (both client and server-side)
6. **No Password Reset**: Intentionally omitted initially - future implementation will use OTP (One-Time Password) system

### Data Protection & Privacy

7. **Contact Info Protection**: Contact details only visible based on user privacy settings
8. **Data Retention**: Users can delete their profiles and all associated data
9. **Session Security**: Secure session handling with appropriate expiration times
10. **CSRF Protection**: All forms protected against Cross-Site Request Forgery

### Operational Security

11. **Rate Limiting**: Limit preference updates, contact reveals, and other user actions
12. **Admin Oversight**: Admins can moderate inappropriate profiles if needed
13. **Audit Logging**: Log important user actions (registration, profile changes, contact reveals)
14. **Database Security**: Use prepared statements, validate all database inputs

### Future Security Enhancements

- **OTP Authentication**: Replace password-based auth with email/SMS OTP system
- **Two-Factor Authentication**: Optional 2FA for enhanced account security
- **Email Verification**: Verify email addresses during registration
- **Account Recovery**: Secure account recovery without traditional password reset

## Future Enhancement Ideas

- Time slot specificity (not just days)
- In-app messaging system
- Group formation tools (organizing specific game nights)
- Rating/feedback system for gaming experiences
- Integration with calendar systems
- Push notifications for new matches

## Phase 6: Contact Method Flexibility Enhancement

**Status**: PLANNED - Implementation scheduled for next development session

**Acceptance Criteria**: Users can select their preferred contact method from multiple options with appropriate validation and display

**Overview**: Replace the current dual contact system (email + phone) with a flexible single contact method selection system that allows users to choose their preferred communication channel.

### Database Schema Update

Replace existing contact fields in `users` table:
```sql
-- REMOVE these fields:
contact_email: text('contact_email'),
contact_phone: text('contact_phone'),

-- ADD these fields: 
contact_method: text('contact_method'), -- 'email', 'phone', 'whatsapp', 'discord'
contact_value: text('contact_value'), -- The actual contact information
-- KEEP existing:
contact_visible_to: text('contact_visible_to').default('matches')
```

### Implementation Steps

1. **Database Migration**
   - Update schema definition in `src/lib/server/db/schema.ts` ✅ COMPLETED
   - Generate migration: `npm run db:generate`
   - Run migration: `npm run db:migrate`
   - Verify schema in production using MCP Turso tools

2. **Package Dependencies**
   - Install `@iconify/svelte` for contact method icons ✅ COMPLETED

3. **Registration Form Enhancement** (`src/routes/register/+page.svelte`)
   - Replace dual email/phone inputs with:
     - Contact method selection dropdown (Email, Phone, WhatsApp, Discord)
     - Single dynamic input field with method-specific validation
     - Method-specific placeholder text
   - Update client-side validation logic
   - Remove existing email/phone validation functions

4. **Registration Server Logic** (`src/routes/register/+page.server.ts`)
   - Update validation to work with `contact_method` and `contact_value`
   - Implement method-specific validation:
     - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
     - Phone/WhatsApp: `/^[+]?[\d\s\-\(\)]{8,}$/`
     - Discord: Accept any string format (both @username and username#1234)
   - Update database insertion logic

5. **Profile Page Updates**
   - Update `src/routes/profile/+page.svelte` for new contact method display/editing
   - Update `src/routes/profile/+page.server.ts` server logic
   - Maintain consistency with registration form UX

6. **Party Finder Display Updates**
   - Update `src/lib/components/PlayerDiscoveryTable.svelte`:
     - Display contact method type with Iconify icons
     - Update contact sharing/reveal logic
     - Replace existing email/phone display logic
   - Update contact visibility functions

### Contact Method Configuration

**Supported Methods**:
- **Email**: Standard email validation, icon: `mdi:email`
- **Phone**: Phone number validation, icon: `mdi:phone`  
- **WhatsApp**: Phone number validation, icon: `mdi:whatsapp`
- **Discord**: String validation (flexible format), icon: `mdi:discord`

**Input Placeholders**:
- Email: "your.email@example.com"
- Phone: "+46 70 123 45 67"
- WhatsApp: "+46 70 123 45 67" 
- Discord: "@username or username#1234"

### Critical Implementation Notes

**Database Migration Safety**:
- Use MCP Turso tools for production database updates
- Test migration in development environment first
- No data preservation required (dev environment only)

**Validation Requirements**:
- Method-specific validation with clear error messages  
- Maintain existing privacy controls compatibility
- Ensure backward compatibility during transition

**UI/UX Consistency**:
- Use Iconify icons for visual contact method identification
- Maintain existing contact sharing privacy logic
- Keep mobile-responsive design patterns

**Files Requiring Updates**:
- `src/lib/server/db/schema.ts` ✅ COMPLETED
- `src/routes/register/+page.svelte` + `+page.server.ts`
- `src/routes/profile/+page.svelte` + `+page.server.ts` 
- `src/lib/components/PlayerDiscoveryTable.svelte`
- Migration files in `drizzle/` directory

### Testing Checklist

- [ ] Database migration runs successfully in dev and production
- [ ] Registration form accepts all 4 contact methods with proper validation
- [ ] Profile page allows editing contact method and value
- [ ] Party finder displays contact methods with appropriate icons
- [ ] Contact sharing logic works with new unified system
- [ ] All existing functionality remains unaffected
- [ ] Mobile responsive design maintained
- [ ] No console errors or TypeScript issues

This enhancement improves user experience by allowing flexible contact preferences while maintaining all existing privacy and security features.

## Implementation Notes for Claude Agents

### Code Quality & Testing

1. **Always run linting**: After each phase, run `npm run lint` and `npm run check`
2. **Test database changes**: Use `npm run studio` to inspect database after migrations
3. **Follow existing patterns**: Match the coding style and component structure of existing files
4. **Incremental testing**: Test each phase thoroughly before moving to the next
5. **Preserve existing functionality**: Ensure admin features and game catalog continue working
6. **Use existing utilities**: Leverage existing components and utilities where possible

### Security Implementation Requirements

7. **Database constraints**: Add UNIQUE constraints on username and email columns (case-insensitive)
8. **Input validation**: Use Zod or similar for comprehensive server-side validation
9. **Password hashing**: Use bcrypt with proper salt rounds (minimum 12)
10. **Serverless rate limiting**: Use `sveltekit-rate-limiter` for Vercel compatibility
11. **CSRF tokens**: Use SvelteKit's built-in CSRF protection for all forms
12. **SQL injection prevention**: Always use parameterized queries with Drizzle ORM
13. **XSS prevention**: Sanitize all user inputs before database storage and display
14. **Session security**: Configure Lucia with secure session settings
15. **Admin separation**: Maintain separate `/admin/login` for admin interface integrity

### Critical Security Checklist ✅ COMPLETED

- [x] Username uniqueness enforced in database schema AND application logic
- [x] Email uniqueness enforced in database schema AND application logic
- [x] Password strength validation implemented and tested
- [x] Registration rate limiting active and tested
- [x] All user inputs sanitized before storage
- [x] No password reset functionality implemented (intentionally omitted)
- [x] All database queries use parameterized statements
- [x] Session cookies configured with secure attributes
- [x] CSRF protection enabled on all forms

## API Endpoints Needed

```
GET/POST /api/party-finder/preferences - Update user party finder settings
GET /api/party-finder/players - Get active players with matching scores
POST /api/party-finder/contact-reveal - Request contact info from another user
GET/POST /api/admin/party-finder-settings - Admin configuration
```

This specification provides a complete blueprint for implementing the Party Finder feature in a structured, testable manner.
