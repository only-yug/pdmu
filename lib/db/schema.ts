import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, index } from "drizzle-orm/sqlite-core";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
    id: text("id").primaryKey(),          // UUID text (as per diagram)
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["alumni", "admin"] }).default("alumni").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
}, (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
}));

// ─── HOTELS ───────────────────────────────────────────────────────────────────
export const hotels = sqliteTable("hotels", {
    id: text("id").primaryKey(),
    userId: text("user_id"),              // FK → users.id (text)
    hotelName: text("hotel_name").notNull(),
    description: text("description"),
    websiteUrl: text("website_url").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// ─── ALUMNI PROFILES ──────────────────────────────────────────────────────────
export const alumniProfiles = sqliteTable("alumni_profiles", {
    id: text("id").primaryKey(),          // UUID text (as per diagram)
    userId: text("user_id"),              // FK → users.id

    rollNumber: integer("roll_number"),   // integer as per diagram (NN)
    fullName: text("full_name").notNull(),
    profilePhotoUrl: text("profile_photo_url"),

    bioJourney: text("bio_journey"),
    favoriteMemories: text("favorite_memories"),
    specialization: text("specialization"),
    currentDesignation: text("current_designation"),
    workplace: text("workplace"),

    country: text("country"),
    state: text("state"),
    city: text("city"),

    email: text("email").notNull().unique(),
    phoneNumber: text("phone_number"),
    whatsappNumber: text("whatsapp_number"),
    linkedinUrl: text("linkedin_url"),
    instagramHandle: text("instagram_handle"),
    facebookUrl: text("facebook_url"),

    personalPhotosJson: text("personal_photos_json"),
    personalVideosJson: text("personal_videos_json"),

    rsvpAdults: integer("rsvp_adults").default(0),
    rsvpKids: integer("rsvp_kids").default(0),
    hotelSelectionId: text("hotel_selection_id").references(() => hotels.id, { onDelete: "set null" }),
    eventId: text("event_id"),
    specialReqs: text("special_reqs"),

    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
}, (table) => ({
    userIdIdx: index("idx_alumni_profiles_user_id").on(table.userId),
    emailIdx: index("idx_alumni_profiles_email").on(table.email),
}));

// ─── CLAIM TOKENS ─────────────────────────────────────────────────────────────
export const claimTokens = sqliteTable("claim_tokens", {
    tokenHash: text("token_hash").primaryKey(),
    alumniId: text("alumni_id").notNull().references(() => alumniProfiles.id, { onDelete: "cascade" }),
    isUsed: integer("is_used", { mode: "boolean" }).default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// ─── MEMORIES ─────────────────────────────────────────────────────────────────
export const memories = sqliteTable("memories", {
    id: text("id").primaryKey(),          // UUID text (as per diagram)
    imageTitle: text("image_title").notNull(),
    imageDescription: text("image_description"),
    imageDate: integer("image_date", { mode: "timestamp" }),
    uploadPhotoUrl: text("upload_photo_url"),
    uploadVideoUrl: text("upload_video_url"),
    uploadedBy: text("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// ─── EVENTS ───────────────────────────────────────────────────────────────────
export const events = sqliteTable("events", {
    id: text("id").primaryKey(),          // UUID text (as per diagram)
    title: text("title").notNull(),
    description: text("description"),

    eventStartDate: integer("event_start_date", { mode: "timestamp" }).notNull(),
    eventEndDate: integer("event_end_date", { mode: "timestamp" }),
    rsvpDeadline: integer("rsvp_deadline", { mode: "timestamp" }),

    venueName: text("venue_name").notNull(),
    venueAddress: text("venue_address"),

    eventScheduleJson: text("event_schedule_json"),
    importantNotesText: text("important_notes_text"),

    bannerImageUrl: text("banner_image_url"),

    totalBatchmatesCount: integer("total_batchmates_count").default(0),
    totalAdultsCount: integer("total_adults_count").default(0),
    totalKidsCount: integer("total_kids_count").default(0),
    totalAttendeesCount: integer("total_attendees_count").default(0),

    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});
