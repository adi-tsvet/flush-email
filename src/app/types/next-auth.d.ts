// src/app/types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: number; // User ID
      username: string; // Username
      gmailId: string; // Gmail address
      gmailAppPassword: string; // Gmail app password
    };
  }

  interface JWT {
    id: number; // User ID
    username: string; // Username
    email?: string | null; // Optional email address
    gmailId: string; // Gmail address
    gmailAppPassword: string; // Gmail app password
  }

  interface User {
    id: number; // User ID
    username: string; // Username
    email?: string | null; // Optional email address
    gmailId: string; // Gmail address
    gmailAppPassword: string; // Gmail app password
  }

  interface AdapterUser {
    id: number; // User ID
    username: string; // Username
    email?: string | null; // Optional email address
    gmailId: string; // Gmail address
    gmailAppPassword: string; // Gmail app password
  }
}
