import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    id: string;
    name: string;
  }

  interface Session {
    user: {
      username?: string | null;
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
  }
} 