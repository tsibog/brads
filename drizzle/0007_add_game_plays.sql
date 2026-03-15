CREATE TABLE `game_plays` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL REFERENCES `users`(`id`),
	`game_bgg_id` text NOT NULL REFERENCES `board_games`(`bgg_id`),
	`play_date` integer DEFAULT (unixepoch()) NOT NULL,
	`player_count` integer NOT NULL,
	`duration_minutes` integer,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
