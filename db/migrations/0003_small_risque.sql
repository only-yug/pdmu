-- Migration to align with final DB schema from diagram
-- Note: PRAGMA foreign_keys=OFF allows safe table recreation

PRAGMA foreign_keys=OFF;
--> statement-breakpoint

-- 1. Drop old unused tables
DROP TABLE IF EXISTS `activity_logs`;
--> statement-breakpoint
DROP TABLE IF EXISTS `announcements`;
--> statement-breakpoint
DROP TABLE IF EXISTS `event_registrations`;
--> statement-breakpoint

-- 2. Recreate alumni_profiles with new schema (mapping old columns to new)
CREATE TABLE `__new_alumni_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`roll_number` integer,
	`full_name` text NOT NULL,
	`profile_photo_url` text,
	`bio_journey` text,
	`favorite_memories` text,
	`specialization` text,
	`current_designation` text,
	`workplace` text,
	`country` text,
	`state` text,
	`city` text,
	`email` text NOT NULL,
	`phone_number` text,
	`whatsapp_number` text,
	`linkedin_url` text,
	`instagram_handle` text,
	`facebook_url` text,
	`personal_photos_json` text,
	`personal_videos_json` text,
	`rsvp_adults` integer DEFAULT 0,
	`rsvp_kids` integer DEFAULT 0,
	`hotel_selection_id` text,
	`event_id` text,
	`special_reqs` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`hotel_selection_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint

-- Map old columns to new: first_name + last_name -> full_name, etc.
INSERT INTO `__new_alumni_profiles`("id", "user_id", "roll_number", "full_name", "profile_photo_url", "bio_journey", "favorite_memories", "specialization", "current_designation", "workplace", "country", "state", "city", "email", "phone_number", "whatsapp_number", "linkedin_url", "instagram_handle", "facebook_url", "personal_photos_json", "personal_videos_json", "rsvp_adults", "rsvp_kids", "hotel_selection_id", "event_id", "special_reqs", "updated_at")
SELECT
  CAST("id" AS text),
  CAST("user_id" AS text),
  "roll_number",
  COALESCE(NULLIF(TRIM(COALESCE("first_name", '') || ' ' || COALESCE("last_name", '')), ''), COALESCE("email", 'Unknown')),
  "profile_photo_url",
  "bio_journey",
  "favorite_memories",
  "specialization",
  "current_position",
  "current_hospital",
  "current_country",
  NULL,
  "current_city",
  "email",
  "phone",
  "whatsapp_number",
  "linkedin_url",
  "instagram_handle",
  "facebook_url",
  "personal_photos_json",
  "personal_videos_json",
  "rsvp_adults",
  "rsvp_kids",
  "hotel_selection_id",
  NULL,
  "special_reqs",
  "updated_at"
FROM `alumni_profiles`;
--> statement-breakpoint

DROP TABLE `alumni_profiles`;
--> statement-breakpoint
ALTER TABLE `__new_alumni_profiles` RENAME TO `alumni_profiles`;
--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_email_unique` ON `alumni_profiles` (`email`);
--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_user_id` ON `alumni_profiles` (`user_id`);
--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_email` ON `alumni_profiles` (`email`);
--> statement-breakpoint

-- 3. Now create claim_tokens AFTER alumni_profiles is in final state
CREATE TABLE IF NOT EXISTS `claim_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`alumni_id` text NOT NULL,
	`is_used` integer DEFAULT false,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- 4. Recreate events with new schema
CREATE TABLE `__new_events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_start_date` integer NOT NULL,
	`event_end_date` integer,
	`rsvp_deadline` integer,
	`venue_name` text NOT NULL,
	`venue_address` text,
	`event_schedule_json` text,
	`important_notes_text` text,
	`banner_image_url` text,
	`total_batchmates_count` integer DEFAULT 0,
	`total_adults_count` integer DEFAULT 0,
	`total_kids_count` integer DEFAULT 0,
	`total_attendees_count` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint

INSERT INTO `__new_events`("id", "title", "description", "event_start_date", "event_end_date", "rsvp_deadline", "venue_name", "venue_address", "event_schedule_json", "important_notes_text", "banner_image_url", "total_batchmates_count", "total_adults_count", "total_kids_count", "total_attendees_count", "created_at", "updated_at")
SELECT CAST("id" AS text), "title", "description", COALESCE("event_start_date", unixepoch()), "event_end_date", "rsvp_deadline", "venue_name", "venue_address", "event_schedule_json", "important_notes_text", "banner_image_url", "total_batchmates_count", "total_adults_count", "total_kids_count", "total_attendees_count", "created_at", "updated_at" FROM `events`;
--> statement-breakpoint

DROP TABLE `events`;
--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;
--> statement-breakpoint

-- 5. Recreate memories with new schema
CREATE TABLE `__new_memories` (
	`id` text PRIMARY KEY NOT NULL,
	`image_title` text NOT NULL,
	`image_description` text,
	`image_date` integer,
	`upload_photo_url` text,
	`upload_video_url` text,
	`uploaded_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint

-- Old memories have different columns; migrate what we can
INSERT INTO `__new_memories`("id", "image_title", "image_description", "upload_photo_url", "uploaded_by", "created_at")
SELECT CAST("id" AS text), COALESCE("title", "caption", 'Memory'), "caption", "photo_url", CAST("user_id" AS text), "uploaded_at" FROM `memories`;
--> statement-breakpoint

DROP TABLE `memories`;
--> statement-breakpoint
ALTER TABLE `__new_memories` RENAME TO `memories`;
--> statement-breakpoint

-- 6. Recreate users with new schema (UUID text id, simplified columns)
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'alumni' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint

INSERT INTO `__new_users`("id", "email", "password_hash", "role", "created_at")
SELECT CAST("id" AS text), "email", COALESCE("password_hash", ''), "role", "created_at" FROM `users`;
--> statement-breakpoint

DROP TABLE `users`;
--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);
--> statement-breakpoint

-- 7. Drop is_approved column from hotels (not in final schema)
ALTER TABLE `hotels` DROP COLUMN `is_approved`;
--> statement-breakpoint

PRAGMA foreign_keys=ON;