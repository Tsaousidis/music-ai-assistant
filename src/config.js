import "dotenv/config";

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
};

if (!config.geminiApiKey) {
  throw new Error("Missing GEMINI_API_KEY in .env");
}