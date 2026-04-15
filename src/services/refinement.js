import { zodToJsonSchema } from "zod-to-json-schema";
import { ai } from "./geminiClient.js";
import { recommendationSchema } from "../schemas/recommendationSchema.js";
import { config } from "../config.js";
import { withRetry } from "../utils/retry.js";

function buildRefinementPrompt(session, refinementPrompt) {
  return `
You are a high-quality music recommendation engine.

We already have an established recommendation session.

Original user query:
${session.originalQuery}

Detected seed song:
${session.detectedTitle} — ${session.detectedArtist}

Current recommendations:
${JSON.stringify(session.currentSongs, null, 2)}

User refinement request:
${refinementPrompt}

Your task:
1. Keep the same detected seed song.
2. Generate a NEW short, creative playlist title (max 5 words) that matches the refined vibe.
3. Return EXACTLY 10 refined song recommendations.

Rules:
- Only real songs
- No duplicates
- Do NOT include the seed song
- At most 1 song from the same artist as the seed
- Avoid repeating too many current songs unless they still strongly fit
- The refinement should meaningfully change the result set
- The playlist title must be short, creative, and natural

Output:
Return ONLY valid JSON.

Format:
{
  "detectedTitle": "...",
  "detectedArtist": "...",
  "playlistName": "...",
  "songs": [
    { "title": "...", "artist": "..." }
  ]
}
`;
}

export async function getRefinedRecommendations(session, refinementPrompt) {
  const response = await withRetry(() =>
    ai.models.generateContent({
      model: config.geminiModel,
      contents: buildRefinementPrompt(session, refinementPrompt),
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: zodToJsonSchema(recommendationSchema),
        temperature: 0.95,
      },
    })
  );

  return recommendationSchema.parse(JSON.parse(response.text));
}