import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SpotifyTrack } from "@/types/spotify";

// Route segment configuration
export const runtime = 'nodejs';
export const maxDuration = 59;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 59 * 1000, // 59 seconds in milliseconds
  maxRetries: 3,
});

export async function POST(req: Request) {
  console.log("[OpenAI API] Starting playlist generation request");
  try {
    const { seedTracks, prompt, numberOfTracks } = await req.json();
    console.log("[OpenAI API] Request parameters:", {
      numberOfTracks,
      prompt,
      seedTracks: seedTracks.map((t: SpotifyTrack) => `${t.name} by ${t.artists[0].name}`),
    });

    const systemPrompt = `You are a professional DJ and music curator with expertise in creating engaging and thematic playlists. Your task is to:
1. Generate song recommendations based on seed tracks and context
2. Create a compelling playlist name that captures the overall theme, mood, and musical journey of ALL tracks (both seed and recommended)
3. Return the response in the exact JSON format specified`;

    const userPrompt = `Based on these seed tracks:
${seedTracks.map((track: SpotifyTrack) => `- "${track.name}" by ${track.artists[0].name}`).join("\n")}

${prompt ? `Additional context: ${prompt}` : ""}

Create a playlist with ${numberOfTracks} songs that:
1. Match the musical style and energy of the input songs
2. Include a mix of well-known and lesser-known tracks
3. Maintain a cohesive flow
4. Include only songs that exist (no made-up songs)

For each song, provide:
- Song name
- Artist name
- A brief (10 words max) explanation of why it fits

After generating all recommendations, analyze both the seed tracks and recommended songs together to create an engaging playlist name that:
1. Reflects the collective mood, era, genre, or theme
2. Captures the musical journey or progression
3. Is creative and memorable
4. Feels cohesive with all tracks, not just the seed songs

Your response must be a JSON object with exactly this structure:
{
  "playlistName": "Your Creative Playlist Name",
  "recommendations": [
    {
      "name": "Song Name",
      "artist": "Artist Name",
      "reason": "Brief explanation"
    }
  ]
}

Do not include any other properties in the JSON response. The array must be under the "recommendations" key.`;

    console.log("[OpenAI API] Sending request to OpenAI");
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      console.error("[OpenAI API] No content in OpenAI response");
      throw new Error("No response from OpenAI");
    }

    console.log("[OpenAI API] Received response from OpenAI:", response);
    const parsedResponse = JSON.parse(response);
    
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations) || !parsedResponse.playlistName) {
      console.error("[OpenAI API] Invalid response format:", parsedResponse);
      throw new Error("Invalid response format from OpenAI");
    }

    // Append "Created by DJ.AI" to the playlist name
    parsedResponse.playlistName = `${parsedResponse.playlistName} • Created by dJai`;

    console.log("[OpenAI API] Successfully generated recommendations");
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("[OpenAI API] Error:", error);
    if (error instanceof Error) {
      console.error("[OpenAI API] Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
} 