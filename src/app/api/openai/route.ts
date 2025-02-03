import { NextResponse } from "next/server";
import OpenAI from "openai";
import { SpotifyTrack } from "@/types/spotify";

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

    const systemPrompt = `You are a professional DJ and music curator. Your task is to create a playlist based on the given seed tracks and optional context. You must return the response in the exact JSON format specified, with a creative playlist name and recommendations array.`;

    const userPrompt = `Based on these tracks:
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

Also, create a creative and engaging playlist name that reflects the mood and theme of the songs.

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