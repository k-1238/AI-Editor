import NextAuth, { type User, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
// import { getUser } from '@/lib/db/queries';

import { authConfig } from "./auth.config";
import axios from "axios";

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/login/",
          {
            email: credentials.email,
            password: credentials.password,
          },
          {
            withCredentials: true,
          }
        );
        if (res.status === 200) {
          localStorage.setItem("access_token", res.data.token);
          localStorage.setItem("refresh_token", res.data.session);
          localStorage.setItem("user", res.data.user);
          return res.data;
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.user = user;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id;
        session.user = token.user;
      }
      return session;
    },
  },
});
