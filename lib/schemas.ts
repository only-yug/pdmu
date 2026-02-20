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
    phoneNumber: z.string().optional(),
    whatsappNumber: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    specialization: z.string().optional(),
    currentDesignation: z.string().optional(),
    workplace: z.string().optional(),
    bioJourney: z.string().optional(),
    favoriteMemories: z.string().optional(),
    linkedinUrl: z.string().url().optional().or(z.literal("")),
    instagramHandle: z.string().optional(),
    facebookUrl: z.string().url().optional().or(z.literal("")),
    profilePhotoUrl: z.string().optional(),
    rsvpAdults: z.number().int().min(0).optional(),
    rsvpKids: z.number().int().min(0).optional(),
    hotelSelectionId: z.string().optional(),
    specialReqs: z.string().optional(),
});
