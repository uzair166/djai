import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { SpotifyApi, AccessToken } from "@spotify/web-api-ts-sdk";
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

export async function GET(request: Request) {
  console.log("[Spotify Search API] Starting search request");
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      console.error("[Spotify Search API] No access token found in session");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      console.error("[Spotify Search API] No search query provided");
      return NextResponse.json({ error: "No search query provided" }, { status: 400 });
    }

    console.log("[Spotify Search API] Searching for:", query);

    let token: SpotifyToken = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken!,
      expiresAt: session.expiresAt || Date.now(),
    };

    // Check if token needs refresh
    if (token.expiresAt < Date.now()) {
      console.log("[Spotify Search API] Token expired, refreshing...");
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

    const results = await spotify.search(query, ["track"], undefined, 10);
    console.log("[Spotify Search API] Found", results.tracks.items.length, "tracks");
    
    return NextResponse.json(results.tracks.items);
  } catch (error) {
    console.error("[Spotify Search API] Error:", error);
    if (error instanceof Error) {
      console.error("[Spotify Search API] Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to search tracks" },
      { status: 500 }
    );
  }
} 