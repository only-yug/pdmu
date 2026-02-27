import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: 'user' | 'alumni' | 'admin';
      alumniProfileId?: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: 'user' | 'alumni' | 'admin';
    alumniProfileId?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: 'user' | 'alumni' | 'admin';
    alumniProfileId?: number;
  }
}
