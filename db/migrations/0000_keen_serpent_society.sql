CREATE TABLE `activity_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` integer,
	`details` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `alumni_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`roll_number` text,
	`first_name` text NOT NULL,
	`middle_name` text,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`date_of_birth` text,
	`degree_type` text,
	`specialization` text,
	`graduation_year` integer,
	`current_city` text,
	`current_country` text,
	`current_hospital` text,
	`current_position` text,
	`years_of_experience` integer,
	`bio_journey` text,
	`favorite_memories` text,
	`linkedin_url` text,
	`instagram_handle` text,
	`facebook_url` text,
	`whatsapp_number` text,
	`personal_photos_json` text,
	`personal_videos_json` text,
	`status` text DEFAULT 'unclaimed' NOT NULL,
	`claim_token` text,
	`claim_token_expires_at` integer,
	`claimed_at` integer,
	`privacy_settings` text DEFAULT '{}',
	`profile_photo_url` text,
	`rsvp_adults` integer DEFAULT 0,
	`rsvp_kids` integer DEFAULT 0,
	`hotel_selection_id` text,
	`special_reqs` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`hotel_selection_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_roll_number_unique` ON `alumni_profiles` (`roll_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_email_unique` ON `alumni_profiles` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_claim_token_unique` ON `alumni_profiles` (`claim_token`);--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_user_id` ON `alumni_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_email` ON `alumni_profiles` (`email`);--> statement-breakpoint
CREATE INDEX `idx_alumni_profiles_status` ON `alumni_profiles` (`status`);--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`is_published` integer DEFAULT false,
	`created_by` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`attendance_status` text NOT NULL,
	`number_of_guests` integer DEFAULT 0,
	`dietary_preferences` text,
	`special_requirements` text,
	`emergency_contact` text,
	`registered_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`event_date` text NOT NULL,
	`event_start_date` integer,
	`event_end_date` integer,
	`rsvp_deadline` integer,
	`venue_name` text NOT NULL,
	`venue_address` text,
	`event_schedule_json` text,
	`important_notes_text` text,
	`max_attendees` integer,
	`total_batchmates_count` integer DEFAULT 0,
	`total_adults_count` integer DEFAULT 0,
	`total_kids_count` integer DEFAULT 0,
	`total_attendees_count` integer DEFAULT 0,
	`banner_image_url` text,
	`is_published` integer DEFAULT false,
	`created_by` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`hotel_name` text NOT NULL,
	`description` text,
	`website_url` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `memories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`photo_url` text NOT NULL,
	`caption` text,
	`uploaded_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`name` text NOT NULL,
	`role` text DEFAULT 'alumni' NOT NULL,
	`email_verified` integer DEFAULT false,
	`email_verification_token` text,
	`email_verification_token_expires_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);