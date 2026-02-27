-- Disable foreign keys temporarily to allow dropping tables
PRAGMA foreign_keys=OFF;

-- 1. DROP related tables (to avoid FK violations during recreation)
DROP TABLE IF EXISTS event_attendees;
DROP TABLE IF EXISTS claim_tokens;
DROP TABLE IF EXISTS alumni_profiles;

-- 2. CREATE tables with NEW schema (ID as INTEGER PRIMARY KEY AUTOINCREMENT)
CREATE TABLE `alumni_profiles` (
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
	`email` text NOT NULL,
	`phone_number` text,
	`whatsapp_number` text,
	`linkedin_url` text,
	`instagram_handle` text,
	`facebook_url` text,
	`is_attending` text,
	`rsvp_adults` integer DEFAULT 0 NOT NULL,
	`rsvp_kids` integer DEFAULT 0 NOT NULL,
	`hotel_selection_id` text,
	`special_reqs` text,
	`latitude` integer,
	`longitude` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

CREATE TABLE `claim_tokens` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`alumni_id` integer NOT NULL,
	`is_used` integer DEFAULT 0,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `event_attendees` (
	`event_id` text NOT NULL,
	`alumni_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`event_id`, `alumni_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`alumni_id`) REFERENCES `alumni_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);

-- 3. SEED 50 ALUMNI (IDs will be auto-generated 1, 2, 3...)
INSERT INTO alumni_profiles (roll_number, full_name, email, phone_number, updated_at) VALUES 
(1, 'Agrawal Akhil', 'manashhospitals@gmail.com', '7665388333', (unixepoch())),
(2, 'Bambhaniya Alpesh', 'dralpeshb@gmail.com', '9727751315', (unixepoch())),
(3, 'Bhalgamia Hiren', 'hirenbhalgamiya@gmail.com', '9924533122', (unixepoch())),
(4, 'Bhetariya Mayur', 'mayur_bhetariya@yahoo.com', '9725315513', (unixepoch())),
(5, 'Bhoraniya Dimple', 'dczalavadia@gmail.com', '9909017447', (unixepoch())),
(6, 'Budhvani Tushar', 'drtushar1357@gmail.com', '9769157539', (unixepoch())),
(7, 'Chaudhary Nirmal', 'nirmalc209@gmail.com', '9909912037', (unixepoch())),
(8, 'Desai Mayur', 'desaimayur2221@yahoo.com', '9712163356', (unixepoch())),
(9, 'Dhanani Dharmesh', 'dhananidharmesh@gmail.com', '9909905865', (unixepoch())),
(10, 'Vishal Dhodi', 'vdhodi31@gmail.com', '9979884952', (unixepoch())),
(11, 'Hiren Dodia', 'drhirendodia@gmail.com', '(+1-306-880-3712)', (unixepoch())),
(12, 'Doshi Nisha', 'nishadoshighodasara@gmail.com', '8980145989', (unixepoch())),
(13, 'Gandhi Rozil', 'rozilgandhi@hotmail.com', '9099070203', (unixepoch())),
(14, 'Gavli Mitesh', 'gavlimitesh6@gmail.com', '7990641126', (unixepoch())),
(15, 'Gupta Naval', 'drnavalgupta2001@gmail.com', '9460138704', (unixepoch())),
(16, 'Gupta Nitisha', 'drnitishaoza82@gmail.com', '9909029882', (unixepoch())),
(17, 'Jiyani Rashmi', 'rashmijiyani@gmail.com', '9737044097', (unixepoch())),
(18, 'Koradiya Rachana', 'dr.rachanasolanki21@gmail.com', '9925244852', (unixepoch())),
(19, 'Mehta Krunal', 'krunaldmehta@yahoo.co.in', '9979890765', (unixepoch())),
(20, 'Mishra Abhishek', 'drabhishek.mishra@delhi.gov.in', '9990633836', (unixepoch())),
(21, 'Muniya Chirag', 'cmuniya@gmail.com', '9825308098', (unixepoch())),
(23, 'Nimavat Harita', 'harita_nimavat@yahoo.com', '9825634373', (unixepoch())),
(24, 'Oza Amit', 'ozaamit442@gmail.com', '9909029832', (unixepoch())),
(25, 'Patel Aarti', 'artypatel21@gmail.com', '9825471736', (unixepoch())),
(26, 'Patel Alpita', 'patel.alpi83@yahoo.com', '404-915-9748', (unixepoch())),
(27, 'Patel Kartik', 'drkartik28@gmail.com', '9909916756', (unixepoch())),
(28, 'Patel Kinjal', 'pkinjal3@gmail.com', '9714106408', (unixepoch())),
(29, 'Patel Kinjal', 'drkinjal1909@gmail.com', '9909234383', (unixepoch())),
(30, 'Patel Nilesh', 'drnilesh2905@gmail.com', '9727717305', (unixepoch())),
(31, 'Patel Sagar', 'drsspatel84@gmail.com', '9909034075', (unixepoch())),
(32, 'Patel Smita', 'drsmita0921@gmail.com', '+1-610-680-7318', (unixepoch())),
(33, 'Patel Yash', 'yashpatel192@gmail.com', '410-718-1720', (unixepoch())),
(34, 'Pathak Swati', 'drswatipathak12@gmail.com', '8130802162', (unixepoch())),
(35, 'Prajapati Bhavesh', 'drbhaveshbprajapati@gmail.com', '9979769067', (unixepoch())),
(36, 'Prajapati Hetal', 'hetal130384@gmail.com', '9427307240', (unixepoch())),
(37, 'Prajapati Vipul', 'drvipul.p.prajapati@gmail.com', '+1-210-896-9230', (unixepoch())),
(38, 'Rana Arun', 'dr.rana.arun@gmail.com', '9724675030', (unixepoch())),
(39, 'Rathod Hemraj', 'drhjrathod@gmail.com', '9925448708', (unixepoch())),
(40, 'Rathod Mital', 'drmitaltank@gmail.com', '8320771831', (unixepoch())),
(42, 'Sarvan Ricky', 'drrickysarvan83@yahoo.com', '9974335405', (unixepoch())),
(43, 'Shah Krunal', 'Krunal2012@gmail.com', '9429250090', (unixepoch())),
(44, 'Sharma Vikas', 'anukas243@gmail.com', '8619286167', (unixepoch())),
(45, 'Sheth Arpita', 'shetharpita23@gmail.com', '9712939256', (unixepoch())),
(48, 'Swadiya Niyati', 'niyati_7@hotmail.com', '9909919756', (unixepoch())),
(49, 'Trivedi Nikhil', 'trivedin50@yahoo.com', '9925819883', (unixepoch())),
(50, 'Vijay Kumar', 'drvijaysehrawat001@gmail.com', '8685844722', (unixepoch()));

-- Re-enable foreign keys
PRAGMA foreign_keys=ON;
