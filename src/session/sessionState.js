export function createSessionState(initialQuery, initialResult) {
  return {
    originalQuery: initialQuery,
    detectedTitle: initialResult.detectedTitle,
    detectedArtist: initialResult.detectedArtist,
    playlistName: initialResult.playlistName,
    currentSongs: initialResult.songs,
    history: [
      {
        type: "initial",
        query: initialQuery,
        result: initialResult.songs
      }
    ]
  };
}

export function updateSessionWithRefinement(
  session,
  refinementPrompt,
  refinedResult
) {
  session.currentSongs = refinedResult.songs;
  session.playlistName = refinedResult.playlistName;

  session.history.push({
    type: "refinement",
    refinementPrompt,
    result: refinedResult.songs
  });

  return session;
}