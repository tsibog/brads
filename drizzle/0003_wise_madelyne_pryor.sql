CREATE TABLE `comments` (
	`id` integer PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`author_name` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `board_games`(`bgg_id`) ON UPDATE no action ON DELETE no action
);
