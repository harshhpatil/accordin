import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.get("/login", (req, res) => {
  const scope = "user-modify-playback-state user-read-playback-state";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    // 1. Read and parse songs.txt dynamically
    const fileContent = await fs.readFile("songs.txt", "utf-8");
    const songList = fileContent
      .split("\n")
      .map((song) => song.trim())
      .filter((song) => song.length > 0);

    if (songList.length === 0) {
      return res
        .status(400)
        .send("songs.txt is empty or missing valid entries.");
    }

    // 2. Exchange code for Access Token
    const tokenResponse = await axios({
      method: "post",
      url: "https://accounts.spotify.com/api/token",
      data: new URLSearchParams({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      },
    });

    const accessToken = tokenResponse.data.access_token;
    const apiHeaders = { Authorization: `Bearer ${accessToken}` };

    // 3. Resolve Track URIs from the text file list
    const trackUris = [];
    for (const song of songList) {
      const searchResponse = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track&limit=1`,
        {
          headers: apiHeaders,
        },
      );

      if (searchResponse.data.tracks.items.length > 0) {
        trackUris.push(searchResponse.data.tracks.items[0].uri);
      }
    }

    if (trackUris.length === 0) {
      return res.status(404).send("No tracks found to play.");
    }

    // 4. Get Active Device
    const devicesResponse = await axios.get(
      "https://api.spotify.com/v1/me/player/devices",
      {
        headers: apiHeaders,
      },
    );

    const activeDevice =
      devicesResponse.data.devices.find((d) => d.is_active) ||
      devicesResponse.data.devices[0];

    if (!activeDevice) {
      return res
        .status(404)
        .send(
          "No active Spotify device found. Please open Spotify on your machine first.",
        );
    }

    // 5. Force Playback of the exact list
    await axios({
      method: "put",
      url: `https://api.spotify.com/v1/me/player/play?device_id=${activeDevice.id}`,
      headers: apiHeaders,
      data: { uris: trackUris },
    });

    res.send(
      `Successfully injected ${trackUris.length} tracks into device:${activeDevice.name}. Check your Spotify application.`,
    );
  } catch (error) {
    console.error(
      "Error during execution:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).send("An error occurred. Check the terminal logs.");
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(
    `To start playback, ensure songs.txt is saved, open Spotify, and go to: http://localhost:${PORT}/login`,
  );
});
