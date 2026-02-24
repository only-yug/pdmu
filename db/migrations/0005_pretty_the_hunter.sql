CREATE TABLE `event_attendees` (
	`event_id` text NOT NULL,
	`alumni_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`event_id`, `alumni_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_event_attendees_event_id` ON `event_attendees` (`event_id`);--> statement-breakpoint
CREATE INDEX `idx_event_attendees_alumni_id` ON `event_attendees` (`alumni_id`);