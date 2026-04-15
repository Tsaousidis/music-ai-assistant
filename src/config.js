import "dotenv/config";

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
};

if (!config.geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY in .env");
}

if (!config.spotifyClientId) {
  throw new Error("Missing SPOTIFY_CLIENT_ID in .env");
}

if (!config.spotifyClientSecret) {
  throw new Error("Missing SPOTIFY_CLIENT_SECRET in .env");
}

if (!config.spotifyRedirectUri) {
  throw new Error("Missing SPOTIFY_REDIRECT_URI in .env");
}