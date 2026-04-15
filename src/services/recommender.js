import { zodToJsonSchema } from "zod-to-json-schema";
import { ai } from "./geminiClient.js";
import { recommendationSchema } from "../schemas/recommendationSchema.js";
import { config } from "../config.js";
import { withRetry } from "../utils/retry.js";

function buildPrompt(rawInput) {
  return `
You are a high-quality music recommendation engine.

User input:
${rawInput}

Steps:
1. Identify the song (title + artist) as accurately as possible.
2. Understand its vibe, production, and mood.
3. Generate a short, creative playlist title (max 5 words) that captures the vibe of the recommendations.
4. Return EXACTLY 10 similar songs.

Rules:
- Only real songs
- No duplicates
- Do NOT include the input song
- At most 1 song from the same artist
- Avoid obvious or lazy recommendations
- Prefer strong vibe similarity over popularity
- The playlist title must be short, creative, and natural

Output:
Return ONLY valid JSON.

Format:
{
  "detectedTitle": "...",
  "detectedArtist": "...",
  "playlistName": "Neon Night Drive",
  "songs": [
    { "title": "...", "artist": "..." }
  ]
}
`;
}

export async function getRecommendations(rawInput) {
  const response = await withRetry(() =>
    ai.models.generateContent({
      model: config.geminiModel,
      contents: buildPrompt(rawInput),
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(recommendationSchema),
        temperature: 0.9
      }
    })
  );

  return recommendationSchema.parse(JSON.parse(response.text));
}