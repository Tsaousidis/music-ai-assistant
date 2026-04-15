import { getRecommendations } from "./services/recommender.js";
import { getRefinedRecommendations } from "./services/refinement.js";
import { buildYouTubeSearchUrl } from "./utils/youtubeSearchLink.js";
import { askYesNo } from "./utils/askYesNo.js";
import { askText } from "./utils/askText.js";
import { createSessionState, updateSessionWithRefinement } from "./session/sessionState.js";
import { authenticateSpotify } from "./services/spotify/auth.js";
import { searchSpotifyTrackUris } from "./services/spotify/search.js";
import {
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist,
} from "./services/spotify/playlist.js";
import { formatError } from "./utils/formatError.js";

function enrichResultWithYoutubeLinks(result) {
  return {
    ...result,
    songs: result.songs.map((song) => ({
      ...song,
      youtubeSearchUrl: buildYouTubeSearchUrl(song.title, song.artist),
    })),
  };
}

function printResult(result, label = "Recommendations") {
  console.log(`\n${label}:\n`);
  console.log(JSON.stringify(result, null, 2));
}

async function maybeCreateSpotifyPlaylist(result) {
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
    await searchSpotifyTrackUris(spotifyApi, result.songs);

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

  const playlistName = result.playlistName;
  const description = `Generated from "${result.detectedTitle}" by ${result.detectedArtist}`;

  const playlist = await createSpotifyPlaylist(
    spotifyApi,
    playlistName,
    description
  );

  await addTracksToSpotifyPlaylist(spotifyApi, playlist.playlistId, uris);

  console.log(`\nPlaylist created: ${playlist.playlistName}`);
  console.log(`Open it here: ${playlist.playlistUrl}`);
}

async function runRefinementLoop(session) {
  while (true) {
    const shouldRefine = await askYesNo(
      "\nWould you like to refine these recommendations? (y/n): "
    );

    if (!shouldRefine) {
      break;
    }

    const refinementPrompt = await askText(
      "Describe how you want to refine them: "
    );

    if (!refinementPrompt) {
      console.log("Empty refinement prompt. Skipping.");
      continue;
    }

    const refined = await getRefinedRecommendations(session, refinementPrompt);
    const enrichedRefined = enrichResultWithYoutubeLinks(refined);

    updateSessionWithRefinement(session, refinementPrompt, enrichedRefined);

    printResult(enrichedRefined, "Refined recommendations");
  }
}

async function main() {
  try {
    const rawInput = process.argv.slice(2).join(" ").trim();

    if (!rawInput) {
      throw new Error("Provide a song title");
    }

    const initialResult = await getRecommendations(rawInput);
    const enrichedInitialResult = enrichResultWithYoutubeLinks(initialResult);

    printResult(enrichedInitialResult);

    const session = createSessionState(rawInput, enrichedInitialResult);

    await runRefinementLoop(session);

    await maybeCreateSpotifyPlaylist({
      detectedTitle: session.detectedTitle,
      detectedArtist: session.detectedArtist,
      playlistName: session.playlistName,
      songs: session.currentSongs,
    });
  } catch (error) {
    console.error("\nERROR:");
    console.error(formatError(error));
  }
}

main();