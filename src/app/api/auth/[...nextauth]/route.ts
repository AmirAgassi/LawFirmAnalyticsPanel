import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateUser } from "@/utils/users";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('auth attempt for username:', credentials?.username);
        
        if (!credentials?.username || !credentials?.password) {
          console.log('missing credentials');
          return null;
        }
        
        try {
          const isValid = await validateUser(credentials.username, credentials.password);
          console.log('validation result:', isValid);
          
          if (isValid) {
            return { 
              id: credentials.username,
              username: credentials.username,
              name: credentials.username
            };
          }
          return null;
        } catch (error) {
          console.error('auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.name = token.name;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
      }
      return token;
    }
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };