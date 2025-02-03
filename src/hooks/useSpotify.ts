import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { SpotifyApi, AccessToken } from "@spotify/web-api-ts-sdk";

export function useSpotify() {
  const { data: session } = useSession();
  const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      const accessToken: AccessToken = {
        access_token: session.accessToken,
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: session.refreshToken!,
      };

      const api = SpotifyApi.withAccessToken(
        process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
        accessToken
      );
      setSpotifyApi(api);
    }
  }, [session]);

  const login = () => {
    signIn("spotify", { callbackUrl: "/" });
  };

  return {
    spotifyApi,
    session,
    login,
    isAuthenticated: !!session?.accessToken,
  };
} 