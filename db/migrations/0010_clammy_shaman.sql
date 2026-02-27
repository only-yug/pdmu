PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_alumni_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`roll_number` integer,
	`full_name` text NOT NULL,
	`profile_photo_url` text,
	`cover_photo_url` text,
	`bio_journey` text,
	`favorite_memories` text,
	`specialization` text,
	`current_designation` text,
	`workplace` text,
	`country` text,
	`state` text,
	`city` text,
	`latitude` integer,
	`longitude` integer,
	`email` text,
	`phone_number` text,
	`whatsapp_number` text,
	`linkedin_url` text,
	`instagram_handle` text,
	`facebook_url` text,
	`personal_photos_json` text,
	`personal_videos_json` text,
	`rsvp_adults` integer DEFAULT 0,
	`rsvp_kids` integer DEFAULT 0,
	`is_attending` text,
	`hotel_selection_id` text,
	`event_id` text,
	`special_reqs` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`hotel_selection_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_alumni_profiles`("id", "user_id", "roll_number", "full_name", "profile_photo_url", "cover_photo_url", "bio_journey", "favorite_memories", "specialization", "current_designation", "workplace", "country", "state", "city", "latitude", "longitude", "email", "phone_number", "whatsapp_number", "linkedin_url", "instagram_handle", "facebook_url", "personal_photos_json", "personal_videos_json", "rsvp_adults", "rsvp_kids", "is_attending", "hotel_selection_id", "event_id", "special_reqs", "updated_at") SELECT "id", "user_id", "roll_number", "full_name", "profile_photo_url", "cover_photo_url", "bio_journey", "favorite_memories", "specialization", "current_designation", "workplace", "country", "state", "city", "latitude", "longitude", "email", "phone_number", "whatsapp_number", "linkedin_url", "instagram_handle", "facebook_url", "personal_photos_json", "personal_videos_json", "rsvp_adults", "rsvp_kids", "is_attending", "hotel_selection_id", "event_id", "special_reqs", "updated_at" FROM `alumni_profiles`;--> statement-breakpoint
DROP TABLE `alumni_profiles`;--> statement-breakpoint
ALTER TABLE `__new_alumni_profiles` RENAME TO `alumni_profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_email_unique` ON `alumni_profiles` (`email`);--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_user_id` ON `alumni_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_email` ON `alumni_profiles` (`email`);--> statement-breakpoint
CREATE TABLE `__new_claim_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`alumni_id` integer NOT NULL,
	`is_used` integer DEFAULT false,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_claim_tokens`("token_hash", "alumni_id", "is_used", "expires_at", "created_at") SELECT "token_hash", "alumni_id", "is_used", "expires_at", "created_at" FROM `claim_tokens`;--> statement-breakpoint
DROP TABLE `claim_tokens`;--> statement-breakpoint
ALTER TABLE `__new_claim_tokens` RENAME TO `claim_tokens`;--> statement-breakpoint
CREATE TABLE `__new_event_attendees` (
	`event_id` text NOT NULL,
	`alumni_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`event_id`, `alumni_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_event_attendees`("event_id", "alumni_id", "created_at") SELECT "event_id", "alumni_id", "created_at" FROM `event_attendees`;--> statement-breakpoint
DROP TABLE `event_attendees`;--> statement-breakpoint
ALTER TABLE `__new_event_attendees` RENAME TO `event_attendees`;--> statement-breakpoint
CREATE INDEX `idx_event_attendees_event_id` ON `event_attendees` (`event_id`);--> statement-breakpoint
CREATE INDEX `idx_event_attendees_alumni_id` ON `event_attendees` (`alumni_id`);