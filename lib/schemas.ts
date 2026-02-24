import { z } from "zod";

export const registerSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const profileUpdateSchema = z.object({
    fullName: z.string().min(2).optional(),
    phoneNumber: z.string().nullable().optional(),
    whatsappNumber: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    specialization: z.string().nullable().optional(),
    currentDesignation: z.string().nullable().optional(),
    workplace: z.string().nullable().optional(),
    bioJourney: z.string().nullable().optional(),
    favoriteMemories: z.string().nullable().optional(),
    linkedinUrl: z.string().url().or(z.literal("")).nullable().optional(),
    instagramHandle: z.string().nullable().optional(),
    facebookUrl: z.string().url().or(z.literal("")).nullable().optional(),
    profilePhotoUrl: z.string().nullable().optional(),
    rsvpAdults: z.number().int().min(0).nullable().optional(),
    rsvpKids: z.number().int().min(0).nullable().optional(),
    hotelSelectionId: z.string().nullable().optional(),
    specialReqs: z.string().nullable().optional(),
    isAttending: z.enum(["attending", "maybe", "not_attending"]).nullable().optional(),
});
