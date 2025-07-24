CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_availability` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`day_of_week` integer NOT NULL,
	`time_slot_start` text,
	`time_slot_end` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_game_preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game_bgg_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_bgg_id`) REFERENCES `board_games`(`bgg_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `display_name` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `experience_level` text;--> statement-breakpoint
ALTER TABLE `users` ADD `vibe_preference` text;--> statement-breakpoint
ALTER TABLE `users` ADD `looking_for_party` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `party_status` text DEFAULT 'resting';--> statement-breakpoint
ALTER TABLE `users` ADD `open_to_any_game` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `contact_email` text;--> statement-breakpoint
ALTER TABLE `users` ADD `contact_phone` text;--> statement-breakpoint
ALTER TABLE `users` ADD `contact_visible_to` text DEFAULT 'matches';--> statement-breakpoint
ALTER TABLE `users` ADD `last_login` integer;