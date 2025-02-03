import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SpotifyApi, AccessToken } from "@spotify/web-api-ts-sdk";
import { generatePlaylistDescription } from "@/lib/utils";
import { authOptions } from "../../auth/[...nextauth]/route";

interface SpotifyToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

async function refreshAccessToken(token: SpotifyToken): Promise<SpotifyToken> {
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
        refresh_token: token.refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    console.error("[Spotify API] Token refresh error:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log("[Create Playlist API] Starting playlist creation");
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      console.error("[Create Playlist API] No access token found in session");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { name, description, tracks, seedTracks, prompt } = await request.json();
    console.log("[Create Playlist API] Creating playlist:", {
      name,
      tracksCount: tracks.length,
      seedTracksCount: seedTracks.length,
      hasPrompt: !!prompt,
    });

    let token: SpotifyToken = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken!,
      expiresAt: session.expiresAt || Date.now(),
    };

    // Check if token needs refresh
    if (token.expiresAt < Date.now()) {
      console.log("[Create Playlist API] Token expired, refreshing...");
      token = await refreshAccessToken(token);
    }

    const accessToken: AccessToken = {
      access_token: token.accessToken,
      token_type: "Bearer",
      expires_in: Math.floor((token.expiresAt - Date.now()) / 1000),
      refresh_token: token.refreshToken,
    };

    const spotify = SpotifyApi.withAccessToken(
      process.env.SPOTIFY_CLIENT_ID!,
      accessToken
    );

    // Get user's ID
    console.log("[Create Playlist API] Fetching user profile");
    const me = await spotify.currentUser.profile();

    // Create playlist
    console.log("[Create Playlist API] Creating empty playlist");
    const playlist = await spotify.playlists.createPlaylist(me.id, {
      name,
      description: description || generatePlaylistDescription(seedTracks, prompt),
      public: false,
    });

    // Add tracks to playlist
    if (tracks && tracks.length > 0) {
      console.log("[Create Playlist API] Adding", tracks.length, "tracks to playlist");
      const trackUris = tracks.map((track: { uri: string }) => track.uri);
      await spotify.playlists.addItemsToPlaylist(playlist.id, trackUris);
    }

    console.log("[Create Playlist API] Successfully created playlist:", playlist.id);
    return NextResponse.json(playlist);
  } catch (error) {
    console.error("[Create Playlist API] Error:", error);
    if (error instanceof Error) {
      console.error("[Create Playlist API] Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 }
    );
  }
} 