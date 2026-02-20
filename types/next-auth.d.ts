import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: 'alumni' | 'admin';
    } & DefaultSession["user"];
  }

  interface User {
    role: 'alumni' | 'admin';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: 'alumni' | 'admin';
  }
}
