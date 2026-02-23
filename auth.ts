import NextAuth from "next-auth";
import { z } from "zod";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { users, alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/crypto";

// Helper to get user from D1
import { getDrizzleDb } from "@/lib/db";

async function getUserByEmail(email: string) {
  try {
    const database = getDrizzleDb();
    return await database.select().from(users).where(eq(users.email, email)).get();
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserByEmail(email);

          if (!user) return null;

          // Verify password using Web Crypto
          const passwordsMatch = await verifyPassword(password, user.passwordHash || "");

          if (passwordsMatch) {
            // Fetch alumni profile to see if this user is a batchmate
            const db = getDrizzleDb();
            const profile = await db.select()
              .from(alumniProfiles)
              .where(eq(alumniProfiles.email, user.email))
              .get();

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.email,
              role: user.role,
              alumniProfileId: profile?.id,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    // Auto-create user + Link alumniProfile on first Google sign-in
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const database = getDrizzleDb();

          // 1. Whitelist Check: does this email exist in the prepopulated 50 profiles?
          const profile = await database.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.email, user.email))
            .get();

          // 2. Check if general User record already exists
          const existingUser = await database.select()
            .from(users)
            .where(eq(users.email, user.email))
            .get();

          let currentUserId = existingUser?.id;

          if (!existingUser) {
            // Create user account
            currentUserId = crypto.randomUUID();
            await database.insert(users).values({
              id: currentUserId,
              email: user.email,
              passwordHash: '', // Google users don't have passwords
              role: 'alumni', // Standard role
            }).run();
          }

          // 3. Link the session variables
          user.id = currentUserId!;
          (user as any).role = existingUser?.role || 'alumni';

          // 4. If they are a whitelisted batchmate, link their profile
          if (profile) {
            (user as any).alumniProfileId = profile.id;

            // If the profile isn't associated with the User DB yet, link it
            if (!profile.userId) {
              await database.update(alumniProfiles)
                .set({ userId: currentUserId })
                .where(eq(alumniProfiles.id, profile.id))
                .run();
            }
          }

        } catch (error) {
          console.error('Google sign-in user creation error:', error);
          return false; // Block sign-in on error
        }
      }
      return true;
    },
  },
});
