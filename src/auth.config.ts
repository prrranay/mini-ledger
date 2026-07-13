import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || 
                            nextUrl.pathname.startsWith('/transactions') || 
                            nextUrl.pathname.startsWith('/analytics') || 
                            nextUrl.pathname.startsWith('/settings');
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/register' || nextUrl.pathname === '/') {
           return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // This will be called from the Edge middleware, so we can't use Prisma directly here easily if it relies on Node.js APIs
        // Actually, in NextAuth v5, if we use database strategy, JWT is the default for credentials.
        // We will do the DB check in `auth.ts` where we spread authConfig and override authorize, 
        // but NextAuth v5 beta allows it here if we aren't strict about edge runtime, or we can use Prisma Accelerate.
        // For now, we will handle actual credential checking in the main auth.ts
        return null;
      }
    }),
  ],
  session: {
    strategy: 'jwt' // Required for Credentials provider
  }
} satisfies NextAuthConfig;
