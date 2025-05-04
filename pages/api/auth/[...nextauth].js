// pages\api\auth\[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

const DAYS_30 = 30 * 24 * 60 * 60;

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (isValid && user?.enabled) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/crm/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) token.user = user;
        return token;
      } catch (error) {
        console.error("JWT Error:", error);
        throw new Error("SESSION_ERROR");
      }
    },
    async session({ session, token }) {
      try {
        session.user = token.user;
        return session;
      } catch (error) {
        console.error("Session Error:", error);
        throw new Error("SESSION_EXPIRED");
      }
    },
  },
  session: {
    strategy: "jwt",
    maxAge: DAYS_30,
  },
  jwt: {
    encryption: true,
    maxAge: DAYS_30,
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
