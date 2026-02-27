import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
  interface User {
    role: 'user' | 'alumni' | 'admin';
    alumniProfileId?: number;
  }
  interface Session {
    user: {
      id: string;
      role: 'user' | 'alumni' | 'admin';
      alumniProfileId?: number;
    } & import("next-auth").DefaultSession["user"];
  }
}

export const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnProfile = nextUrl.pathname.startsWith('/profile');
      const isOnDirectory = nextUrl.pathname.startsWith('/directory');

      if (isOnAdmin) {
        // Admin routes require admin role
        return isLoggedIn && auth.user.role === 'admin';
      }

      if (isOnDashboard || isOnProfile || isOnDirectory) {
        // Protected routes require login
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register' || nextUrl.pathname === '/registerProfile')) {
        return Response.redirect(new URL('/leading', nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.alumniProfileId = user.alumniProfileId;
      }

      // Update token if session was updated
      if (trigger === "update" && session && session.user) {
        token.alumniProfileId = session.user.alumniProfileId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'user' | 'alumni' | 'admin';
        session.user.alumniProfileId = token.alumniProfileId as number | undefined;
      }
      return session;
    },
  },
  providers: [], // Add providers here
} satisfies NextAuthConfig;
