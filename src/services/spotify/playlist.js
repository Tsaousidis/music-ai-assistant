export async function createSpotifyPlaylist(spotifyApi, playlistName, description = "") {
  const me = await spotifyApi.getMe();

  const playlist = await spotifyApi.createPlaylist(playlistName, {
    public: false,
    description,
  });

  return {
    userId: me.body.id,
    playlistId: playlist.body.id,
    playlistUrl: playlist.body.external_urls?.spotify || null,
    playlistName: playlist.body.name,
  };
}

export async function addTracksToSpotifyPlaylist(spotifyApi, playlistId, uris) {
  if (!uris.length) {
    return;
  }

  await spotifyApi.addTracksToPlaylist(playlistId, uris);
}