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

export const authOptions: AuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
          show_dialog: true,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("[Auth Debug] Sign In Callback:", { 
        user, 
        accountId: account?.id,
        profile 
      });
      return true;
    },
    async jwt({ token, account, profile }) {
      console.log("[Auth Debug] JWT Callback:", { 
        hasAccessToken: !!account?.access_token,
        hasRefreshToken: !!account?.refresh_token,
        profile 
      });

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at! * 1000;
      }
      if (token.expiresAt && Date.now() > token.expiresAt) {
        try {
          console.log("[Auth Debug] Token expired, attempting refresh");
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
          if (!response.ok) {
            console.error("[Auth Debug] Token refresh failed:", tokens);
            throw tokens;
          }

          console.log("[Auth Debug] Token refresh successful");
          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refreshToken,
            expiresAt: Date.now() + tokens.expires_in * 1000,
          };
        } catch (error) {
          console.error("[Auth Debug] Error refreshing access token:", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth Debug] Session Callback:", { 
        hasAccessToken: !!token.accessToken,
        hasError: !!token.error
      });
      
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log("[Auth Debug] Redirect Callback:", { url, baseUrl });

      // Handle callback URLs
      if (url.includes("/api/auth/callback/spotify")) {
        const callbackUrl = new URL(url);
        const finalCallbackUrl = `${baseUrl}${callbackUrl.pathname}${callbackUrl.search}`;
        console.log("[Auth Debug] Spotify callback URL:", finalCallbackUrl);
        return finalCallbackUrl;
      }

      // Handle other URLs
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
}; 