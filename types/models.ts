// Type definitions aligned with lib/db/schema.ts

// User model — matches `users` table
export interface User {
  id: string;           // UUID text PK
  email: string;
  password_hash?: string;
  role: 'user' | 'alumni' | 'admin';
  created_at: number;   // unix timestamp
}

// Alumni Profile model — matches `alumni_profiles` table
export interface AlumniProfile {
  id: number;           // Auto-increment Integer PK
  user_id?: string | null;

  // Basic Information
  roll_number?: number | null;
  full_name: string;
  email: string;
  profile_photo_url?: string | null;

  // Bio
  bio_journey?: string | null;
  favorite_memories?: string | null;

  // Professional
  specialization?: string | null;
  current_designation?: string | null;
  workplace?: string | null;

  // Location
  country?: string | null;
  state?: string | null;
  city?: string | null;

  // Contact
  phone_number?: string | null;
  whatsapp_number?: string | null;
  linkedin_url?: string | null;
  instagram_handle?: string | null;
  facebook_url?: string | null;

  // Media
  personal_photos_json?: string | null;
  personal_videos_json?: string | null;

  // RSVP
  rsvp_adults?: number;
  rsvp_kids?: number;
  hotel_selection_id?: string | null;
  event_id?: string | null;
  special_reqs?: string | null;

  // Timestamps
  updated_at: number;
}

// Event model — matches `events` table
export interface Event {
  id: string;           // UUID text PK
  title: string;
  description?: string | null;

  // Dates
  event_start_date: number;   // unix timestamp
  event_end_date?: number | null;
  rsvp_deadline?: number | null;

  // Venue
  venue_name: string;
  venue_address?: string | null;

  // Details
  event_schedule_json?: string | null;
  important_notes_text?: string | null;
  banner_image_url?: string | null;

  // Counts
  total_batchmates_count?: number;
  total_adults_count?: number;
  total_kids_count?: number;
  total_attendees_count?: number;

  // Timestamps
  created_at: number;
  updated_at: number;
}

// Memory model — matches `memories` table
export interface Memory {
  id: string;           // UUID text PK
  image_title: string;
  image_description?: string | null;
  image_date?: number | null;
  upload_photo_url?: string | null;
  upload_video_url?: string | null;
  uploaded_by?: string | null;
  created_at: number;
}

// Hotel model — matches `hotels` table
export interface Hotel {
  id: string;           // UUID text PK
  user_id?: string | null;
  hotel_name: string;
  description?: string | null;
  website_url: string;
  created_at: number;
}

// Claim Token model — matches `claim_tokens` table
export interface ClaimToken {
  token_hash: string;   // text PK
  alumni_id: number;
  is_used: boolean;
  expires_at: number;
  created_at: number;
}
