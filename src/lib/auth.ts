import { AuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const scopes = [
  "user-read-email",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-read",
  "user-read-private",
].join(" ");

// Get the base URL for the environment
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
};

export const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope: scopes,
          show_dialog: true,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at! * 1000;
      }
      if (token.expiresAt && Date.now() > token.expiresAt) {
        try {
          const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(
                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
              ).toString("base64")}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          });

          const tokens = await response.json();
          if (!response.ok) throw tokens;

          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refreshToken,
            expiresAt: Date.now() + tokens.expires_in * 1000,
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always use the production URL for redirects in production
      const productionBaseUrl = "https://spotifydjai.vercel.app";
      // const finalBaseUrl = process.env.VERCEL_URL ? productionBaseUrl : baseUrl;
      const finalBaseUrl = productionBaseUrl;

      if (url.startsWith("/")) return `${finalBaseUrl}${url}`;
      else if (new URL(url).origin === finalBaseUrl) return url;
      return finalBaseUrl;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  // Always use HTTPS in production
  useSecureCookies: process.env.VERCEL_URL ? true : false,
  cookies: {
    sessionToken: {
      name: process.env.VERCEL_URL ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.VERCEL_URL ? true : false,
      },
    },
  },
}; 