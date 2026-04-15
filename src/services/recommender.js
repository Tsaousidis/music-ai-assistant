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
3. Return EXACTLY 10 similar songs.

Rules:
- Only real songs
- No duplicates
- Do NOT include the input song
- At most 1 song from the same artist
- Avoid obvious or lazy recommendations
- Prefer strong vibe similarity over popularity

Output:
Return ONLY valid JSON.

Format:
{
  "detectedTitle": "...",
  "detectedArtist": "...",
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