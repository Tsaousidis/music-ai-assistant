import { getRecommendations } from "./services/recommender.js";
import { buildYouTubeSearchUrl } from "./utils/youtubeSearchLink.js";

async function main() {
  try {
    const rawInput = process.argv.slice(2).join(" ").trim();

    if (!rawInput) {
      throw new Error("Provide a song title");
    }

    const result = await getRecommendations(rawInput);

    const enrichedResult = {
      ...result,
      songs: result.songs.map((song) => ({
        ...song,
        youtubeSearchUrl: buildYouTubeSearchUrl(song.title, song.artist)
      }))
    };

    console.log(JSON.stringify(enrichedResult, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

main();