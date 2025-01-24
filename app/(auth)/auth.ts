import NextAuth, { type Session, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { toast } from "sonner";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

interface ExtendedUser extends User {
  accessToken: string;
  refreshToken: string;
  ref: number;
}

interface ExtendedSession extends Session {
  user: User & {
    pk: number;
    accessToken: string;
    refreshToken: string;
    ref: number;
  };
}

interface BackendResponse {
  user: User;
  access: string;
  refresh: string;
}

const BACKEND_ACCESS_TOKEN_LIFETIME = 45 * 60; // 45 minutes
const BACKEND_REFRESH_TOKEN_LIFETIME = 6 * 24 * 60 * 60; // 6 days

const getCurrentEpochTime = () => Math.floor(Date.now() / 1000);
const SIGN_IN_HANDLERS: { [key: string]: (account: any) => Promise<boolean> } =
  {
    credentials: async (account: any): Promise<boolean> => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login/`,
          {
            email: account.email,
            password: account.password,
          },
          {
            withCredentials: true,
          }
        );
        account.meta = response.data;
        return true;
      } catch (error) {
        console.error("Error in credentials sign-in handler:", error);
        return false;
      }
    },
    google: async (account: any): Promise<boolean> => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/socials/google/`,
          { access_token: account.id_token }
        );
        account.meta = response.data;
        return true;
      } catch (error) {
        console.error("Error in Google sign-in handler:", error);
        return false;
      }
    },
    github: async (account: any): Promise<boolean> => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/socials/github/`,
          { access_token: account.access_token }
        );
        account.meta = response.data;
        return true;
      } catch (error) {
        console.error("Error in GitHub sign-in handler:", error);
        return false;
      }
    },
  };

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null; // or handle validation error
          }

          const response = await axios.post<BackendResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login/`,
            {
              email: credentials.email, // Use credentials.email directly
              password: credentials.password, // Use credentials.password directly
            },
            {
              withCredentials: true,
            }
          );

          if (response.status === 200) {
            return {
              ...response.data.user,
              accessToken: response.data.access,
              refreshToken: response.data.refresh,
            };
          }

          if (response.status === 400) {
            toast.error("Access Denied");
          }
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          toast.error("Error during credentials authorization:");
          return null;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      authorization:
        "https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code",
    }),
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
      authorization: "https://github.com/login/oauth/authorize",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/signout",
    error: "auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // async signIn({ account }: any) {
    //   if (account?.provider && SIGN_IN_HANDLERS[account.provider]) {
    //     return SIGN_IN_HANDLERS[account.provider](account);
    //   }
    //   return false;
    // },
    async jwt({ token, user, account }: any) {
      if (user && account) {
        token.user = user;
        token.accessToken = (user as ExtendedUser).accessToken;
        token.refreshToken = (user as ExtendedUser).refreshToken;
        token.ref = getCurrentEpochTime() + BACKEND_ACCESS_TOKEN_LIFETIME;
        return token;
      }

      if (token.ref && getCurrentEpochTime() > token.ref) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/token/refresh/`,
            {
              refresh: token.refreshToken,
            }
          );
          token.accessToken = response.data.access;
          token.refreshToken = response.data.refresh;
          token.ref = getCurrentEpochTime() + BACKEND_ACCESS_TOKEN_LIFETIME;
        } catch (error) {
          // console.error("Error refreshing token:", error);
        }
      }
      return token;
    },
    async session({ session, token, user }: any) {
      const extendedSession: ExtendedSession = {
        ...session,
        user: token.user as User,
      };
      return extendedSession;
    },
  },
});
