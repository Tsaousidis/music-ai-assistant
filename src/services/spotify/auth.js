import http from "http";
import { URL } from "url";
import open from "open";
import { createSpotifyClient } from "./client.js";
import { formatError } from "../../utils/formatError.js";

const SCOPES = [
  "playlist-modify-private",
  "playlist-modify-public",
];

function waitForSpotifyCallback(expectedPath = "/callback", port = 8888) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url, `http://127.0.0.1:${port}`);

        if (reqUrl.pathname !== expectedPath) {
          res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Not found.");
          return;
        }

        const code = reqUrl.searchParams.get("code");
        const error = reqUrl.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Spotify authorization failed.");
          server.close();
          reject(new Error(`Spotify authorization error: ${error}`));
          return;
        }

        if (!code) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Missing authorization code.");
          server.close();
          reject(new Error("Missing Spotify authorization code."));
          return;
        }

        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Spotify authorization completed. You can close this tab.");

        server.close();
        resolve(code);
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(port, "127.0.0.1");
  });
}

export async function authenticateSpotify() {
  try {
    const spotifyApi = createSpotifyClient();

    const authUrl = spotifyApi.createAuthorizeURL(
      SCOPES,
      "music-ai-state",
      true
    );

    console.log("\nOpening Spotify login in your browser...");
    await open(authUrl);

    console.log("Waiting for Spotify authorization callback...");

    const code = await waitForSpotifyCallback("/callback", 8888);

    console.log("Received Spotify auth code.");

    const tokenData = await spotifyApi.authorizationCodeGrant(code);

    spotifyApi.setAccessToken(tokenData.body.access_token);
    spotifyApi.setRefreshToken(tokenData.body.refresh_token);

    return spotifyApi;
  } catch (error) {
    console.log("\nSpotify auth failed:");
    console.log(formatError(error));
    throw error;
  }
}