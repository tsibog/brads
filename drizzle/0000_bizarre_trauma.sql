CREATE TABLE `board_games` (
	`id` integer PRIMARY KEY NOT NULL,
	`bgg_id` text NOT NULL,
	`name` text NOT NULL,
	`year_published` integer,
	`min_players` integer,
	`max_players` integer,
	`playing_time` integer,
	`min_play_time` integer,
	`max_play_time` integer,
	`age` integer,
	`description` text,
	`thumbnail` text,
	`image` text,
	`categories` text,
	`mechanics` text,
	`designers` text,
	`artists` text,
	`publishers` text,
	`is_starred` integer DEFAULT false,
	`admin_note` text,
	`test` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `board_games_bgg_id_unique` ON `board_games` (`bgg_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);