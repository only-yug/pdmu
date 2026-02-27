ALTER TABLE `users` ADD `full_name` text;
--> statement-breakpoint
CREATE INDEX `idx_users_full_name` ON `users` (`full_name`);
