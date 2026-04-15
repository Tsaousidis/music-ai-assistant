import SpotifyWebApi from "spotify-web-api-node";
import { config } from "../../config.js";

export function createSpotifyClient() {
  return new SpotifyWebApi({
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    redirectUri: config.spotifyRedirectUri,
  });
}