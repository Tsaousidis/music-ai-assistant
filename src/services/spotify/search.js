function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function formatSpotifyError(error) {
  try {
    return JSON.stringify(
      {
        message: error?.message ?? null,
        statusCode: error?.statusCode ?? null,
        body: error?.body ?? null,
        stack: error?.stack ?? null
      },
      null,
      2
    );
  } catch {
    return String(error);
  }
}

export async function searchSpotifyTrackUris(spotifyApi, songs) {
  const uris = [];
  const matchedSongs = [];
  const unmatchedSongs = [];

  for (const song of songs) {
    const title = song.title;
    const artist = song.artist;

    try {
      let items = [];

      const strictQuery = `track:${title} artist:${artist}`;
      const strictResult = await spotifyApi.searchTracks(strictQuery, { limit: 5 });
      items = strictResult.body?.tracks?.items || [];

      if (!items.length) {
        const fallbackQuery = `${title} ${artist}`;
        const fallbackResult = await spotifyApi.searchTracks(fallbackQuery, { limit: 5 });
        items = fallbackResult.body?.tracks?.items || [];
      }

      if (!items.length) {
        unmatchedSongs.push(song);
        continue;
      }

      const exactish = items.find((item) => {
        const itemName = normalize(item.name);
        const itemArtists = normalize(item.artists?.map((a) => a.name).join(" "));
        return itemName.includes(normalize(title)) && itemArtists.includes(normalize(artist));
      });

      const best = exactish || items[0];

      if (best?.uri) {
        uris.push(best.uri);
        matchedSongs.push({
          requested: song,
          matched: {
            name: best.name,
            artists: best.artists?.map((a) => a.name).join(", "),
            uri: best.uri,
            url: best.external_urls?.spotify || null
          }
        });
      } else {
        unmatchedSongs.push(song);
      }
    } catch (error) {
      console.log(`\nSpotify search failed for ${title} — ${artist}`);
      console.log(formatSpotifyError(error));
      unmatchedSongs.push(song);
    }
  }

  return {
    uris,
    matchedSongs,
    unmatchedSongs
  };
}