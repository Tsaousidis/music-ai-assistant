import { getRecommendations } from "./services/recommender.js";
import { buildYouTubeSearchUrl } from "./utils/youtubeSearchLink.js";
import { askYesNo } from "./utils/askYesNo.js";
import { authenticateSpotify } from "./services/spotify/auth.js";
import { searchSpotifyTrackUris } from "./services/spotify/search.js";
import {
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
} from "./services/spotify/playlist.js";
import { formatError } from "./utils/formatError.js";

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
        youtubeSearchUrl: buildYouTubeSearchUrl(song.title, song.artist),
      })),
    };

    console.log("\nRecommendations:\n");
    console.log(JSON.stringify(enrichedResult, null, 2));

    const shouldCreatePlaylist = await askYesNo(
      "\nCreate Spotify playlist with these songs? (y/n): "
    );

    if (!shouldCreatePlaylist) {
      console.log("Okay, skipping Spotify playlist creation.");
      return;
    }

    const spotifyApi = await authenticateSpotify();

    const me = await spotifyApi.getMe();
    console.log(`\nSpotify authenticated as: ${me.body.display_name || me.body.id}`);

    const { uris, matchedSongs, unmatchedSongs } =
      await searchSpotifyTrackUris(spotifyApi, enrichedResult.songs);

    console.log(`\nMatched ${matchedSongs.length} songs on Spotify.`);

    if (unmatchedSongs.length) {
      console.log("\nUnmatched songs:");
      for (const song of unmatchedSongs) {
        console.log(`- ${song.title} — ${song.artist}`);
      }
    }

    if (!uris.length) {
      console.log("\nNo Spotify tracks were matched, so no playlist was created.");
      return;
    }

    const playlistName = `AI Mix - ${enrichedResult.detectedTitle}`;
    const description = `Generated from "${enrichedResult.detectedTitle}" by ${enrichedResult.detectedArtist}`;

    const playlist = await createSpotifyPlaylist(
      spotifyApi,
      playlistName,
      description
    );

    await addTracksToSpotifyPlaylist(spotifyApi, playlist.playlistId, uris);

    console.log(`\nPlaylist created: ${playlist.playlistName}`);
    console.log(`Open it here: ${playlist.playlistUrl}`);
  } catch (error) {
    console.error("\nERROR:");
    console.error(formatError(error));
  }
}

main();