DROP TABLE `users`;--> statement-breakpoint
DROP TABLE `new_users`;--> statement-breakpoint
CREATE TABLE `users` (
    `id` text PRIMARY KEY NOT NULL,
    `username` text NOT NULL UNIQUE,
    `email` text UNIQUE,
    `password_hash` text NOT NULL,
    `is_admin` integer DEFAULT 0 NOT NULL,
    `created_at` integer NOT NULL DEFAULT (unixepoch()),
    `updated_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `session` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` text NOT NULL,
    `expires_at` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);