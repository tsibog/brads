CREATE TABLE `game_views` (
	`id` integer PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL REFERENCES `board_games`(`bgg_id`),
	`viewed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`path` text
);
