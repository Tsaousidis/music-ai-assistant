import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import { getRecommendations } from "./services/recommender.js";
import { getRefinedRecommendations } from "./services/refinement.js";
import {
  createSessionState,
  updateSessionWithRefinement
} from "./session/sessionState.js";
import { formatError } from "./utils/formatError.js";

import { authenticateSpotify } from "./services/spotify/auth.js";
import { searchSpotifyTrackUris } from "./services/spotify/search.js";
import {
  createSpotifyPlaylist,
  addTracksToSpotifyPlaylist
} from "./services/spotify/playlist.js";

const app = express();

app.use(cors());
app.use(express.json());

const sessions = {};

app.post("/recommend", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    const result = await getRecommendations(String(query).trim());

    const sessionId = uuidv4();
    const session = createSessionState(String(query).trim(), result);

    sessions[sessionId] = session;

    res.json({
      sessionId,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to generate recommendations",
      details: formatError(error)
    });
  }
});

app.post("/refine", async (req, res) => {
  try {
    const { sessionId, prompt } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const refined = await getRefinedRecommendations(
      session,
      String(prompt).trim()
    );

    updateSessionWithRefinement(session, String(prompt).trim(), refined);

    res.json({
      sessionId,
      ...refined
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to refine recommendations",
      details: formatError(error)
    });
  }
});

app.post("/playlist", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const spotifyApi = await authenticateSpotify();

    const me = await spotifyApi.getMe();

    const { uris, matchedSongs, unmatchedSongs } =
      await searchSpotifyTrackUris(spotifyApi, session.currentSongs);

    if (!uris.length) {
      return res.status(400).json({
        error: "No Spotify tracks matched",
        matchedSongs,
        unmatchedSongs
      });
    }

    const playlistName =
      session.playlistName || `Inspired by ${session.detectedTitle}`;

    const description = `Generated from "${session.detectedTitle}" by ${session.detectedArtist}`;

    const playlist = await createSpotifyPlaylist(
      spotifyApi,
      playlistName,
      description
    );

    await addTracksToSpotifyPlaylist(spotifyApi, playlist.playlistId, uris);

    res.json({
      success: true,
      user: me.body.display_name || me.body.id,
      playlistName: playlist.playlistName,
      playlistUrl: playlist.playlistUrl,
      matchedSongs,
      unmatchedSongs
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create Spotify playlist",
      details: formatError(error)
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});