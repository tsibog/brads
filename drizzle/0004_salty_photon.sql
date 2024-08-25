CREATE TABLE `new_gameComments` (
  `id` integer PRIMARY KEY,
  `game_id` text NOT NULL,
  `author_name` text NOT NULL,
  `content` text NOT NULL,
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `is_approved` integer NOT NULL DEFAULT 0,
  FOREIGN KEY (`game_id`) REFERENCES `board_games`(`bgg_id`)
);
--> statement-breakpoint
INSERT INTO `new_gameComments` SELECT * FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `new_gameComments` RENAME TO `gameComments`;