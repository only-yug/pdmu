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
            return {
              id: user.id.toString(),
              email: user.email,
              name: user.email,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    // Auto-create user + alumniProfile on first Google sign-in
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const database = getDrizzleDb();
          const existingUser = await database.select()
            .from(users)
            .where(eq(users.email, user.email))
            .get();

          if (!existingUser) {
            // Create user account
            const newUserId = crypto.randomUUID();
            await database.insert(users).values({
              id: newUserId,
              email: user.email,
              passwordHash: '', // Google users don't have passwords
              role: 'alumni',
            }).run();

            // Create empty alumni profile linked to the new user
            await database.insert(alumniProfiles).values({
              id: crypto.randomUUID(),
              userId: newUserId,
              email: user.email,
              fullName: user.name || user.email.split('@')[0],
            }).run();

            // Set user.id so JWT callback picks up the right id
            user.id = newUserId;
            (user as any).role = 'alumni';
          } else {
            // Existing user — set id/role so JWT gets correct values
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
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
