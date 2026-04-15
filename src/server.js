import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import { getRecommendations } from "./services/recommender.js";
import { getRefinedRecommendations } from "./services/refinement.js";
import { createSessionState, updateSessionWithRefinement } from "./session/sessionState.js";

const app = express();
app.use(cors());
app.use(express.json());

const sessions = {}; // in-memory store

// INITIAL RECOMMEND
app.post("/recommend", async (req, res) => {
  try {
    const { query } = req.body;

    const result = await getRecommendations(query);

    const sessionId = uuidv4();

    const session = createSessionState(query, result);

    sessions[sessionId] = session;

    res.json({
      sessionId,
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REFINE
app.post("/refine", async (req, res) => {
  try {
    const { sessionId, prompt } = req.body;

    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const refined = await getRefinedRecommendations(session, prompt);

    updateSessionWithRefinement(session, prompt, refined);

    res.json(refined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});