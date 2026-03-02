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

          const { email: rawEmail, password } = parsedCredentials.data;
          const email = rawEmail.toLowerCase();
          console.log('[Auth Debug] Authorize called for email:', email);

          const user = await getUserByEmail(email);

          if (!user) {
            console.log('[Auth Debug] User not found for email:', email);
            return null;
          }

          console.log('[Auth Debug] User found:', user.email, 'Role:', user.role);

          const passwordsMatch = await verifyPassword(password, user.passwordHash || "");
          console.log('[Auth Debug] Password match result:', passwordsMatch);

          if (passwordsMatch) {
            const db = getDrizzleDb();
            const profile = await db.select()
              .from(alumniProfiles)
              .where(eq(alumniProfiles.email, user.email))
              .get();

            return {
              id: user.id.toString(),
              email: user.email,
              name: user.fullName || user.email,
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
          const email = user.email.toLowerCase();

          const database = getDrizzleDb();

          const profile = await database.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.email, email))
            .get();

          const existingUser = await database.select()
            .from(users)
            .where(eq(users.email, email))
            .get();

          let currentUserId = existingUser?.id;

          if (!existingUser) {
            currentUserId = crypto.randomUUID();
            await database.insert(users).values({
              id: currentUserId,
              email: email,
              passwordHash: '',
              fullName: user.name,
              role: profile ? 'alumni' : 'user',
            }).run();
          }

          user.id = currentUserId!;
          (user as any).role = existingUser?.role || (profile ? 'alumni' : 'user');

          if (profile) {
            (user as any).alumniProfileId = profile.id;

            if (!profile.userId) {
              await database.update(alumniProfiles)
                .set({ userId: currentUserId })
                .where(eq(alumniProfiles.id, profile.id))
                .run();
            }
          }

        } catch (error) {
          console.error('Google sign-in user creation error:', error);
          return false;
        }
      }
      return true;
    },
  },
});
