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

const getCurrentEpochTime = () => Math.floor(Date.now() / 1000);
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
        console.log("credentials: ", credentials);
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
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, session }: any) {
      if (account && account.provider === "google") {
        console.log("account: ", account);
        token.accessToken = (account as any).accessToken;
        token.refreshToken = (account as any).refreshToken;
        token.ref = getCurrentEpochTime() + BACKEND_ACCESS_TOKEN_LIFETIME;

        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/socials/google/`,
            {
              access_token: account.access_token,
            }
          );
          account.meta = response.data;
          return token;
        } catch (error: any) {
          if (error.response && error.response.status === 400) {
            const errorData = error.response.data;

            if (errorData.non_field_errors) {
              toast.error(errorData.non_field_errors);
            }
            return false;
          } else {
            console.log("Error in Google sign-in handler:", error);
          }
        }
      }
      if (account && account.provider === "github") {
        token.accessToken = (account as ExtendedUser).accessToken;
        token.refreshToken = (account as ExtendedUser).refreshToken;
        token.ref = getCurrentEpochTime() + BACKEND_ACCESS_TOKEN_LIFETIME;
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/socials/github/`,
            { access_token: account.access_token }
          );
          account.meta = response.data;
          return token;
        } catch (error: any) {
          if (error.response && error.response.status === 400) {
            const errorData = error.response.data;

            if (errorData.non_field_errors) {
              toast.error(errorData.non_field_errors); // user already exists
            }
            return false;
          } else {
            console.log("Error in Google sign-in handler:", error);
          }
        }
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
    async session({ session, token, account, user }: any) {
      const extendedSession: ExtendedSession = {
        ...session,
        user: token.user as User,
      };
      return extendedSession;
    },
  },
});
