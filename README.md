# Accordin
### Local Spotify Queue Controller 🎵

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spotify API](https://img.shields.io/badge/Spotify-Web%20API-1DB954?logo=spotify&logoColor=white)](https://developer.spotify.com/documentation/web-api)

A lightweight, backend-only Node.js service that dynamically reads a list of songs from a local text file and forces an active Spotify device to play them in exact order using the Spotify Web API. Say goodbye to manual playlist creation for quick listening sessions.

---

## ✨ Features

* **Dynamic File Parsing:** Reads directly from `songs.txt` on execution. No server restarts or app reloads required when updating your lineup.
* **Automated URI Resolution:** Automatically queries the Spotify search API to translate raw song titles and artists into valid Spotify Track URIs.
* **Device Takeover:** Detects your active Spotify device (desktop, mobile, or web) and seamlessly overrides the current queue with your custom list.
* **OAuth2 Authentication:** Securely connects to your personal Spotify account via standard authorization code flow.

---

## 🛠️ How It Works

```text
[ songs.txt ] ──> Node.js Backend ──> Spotify Search API ──> Track URIs ──> Active Device Queue
```

1. The service reads your `songs.txt` line by line.
2. It authenticates with Spotify via your local web server callback.
3. Each line is searched against the Spotify catalog to fetch its unique URI.
4. The service targets your active player session and queues/plays the tracks in sequence.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and ready:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [pnpm](https://pnpm.io/) package manager (or npm/yarn)
* A **Spotify Premium** account *(required by Spotify's API to control playback)*
* A free [Spotify Developer Account](https://developer.spotify.com/)

---

## 🚀 Setup & Configuration

### 1. Spotify Developer Dashboard
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create a new application and select **Web API**.
3. In your app settings, add the following Redirect URI:
   `http://localhost:3000/callback`
4. Copy your `Client ID` and `Client Secret`.

### 2. Installation
Clone this repository and install the required dependencies:

```bash
git clone <your-repo-url>
cd local-spotify-controller
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory of your project and populate it with your credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
PORT=3000
```

---

## 🕹️ Usage

1. **Define Your Playlist:** 
   Create a `songs.txt` file in the root directory. Add one song per line. *(Tip: Include the artist name alongside the track title for higher search accuracy).*
   ```text
   Bohemian Rhapsody Queen
   Hotel California Eagles
   Stairway to Heaven Led Zeppelin
   ```

2. **Wake Up Spotify:** 
   Open your Spotify desktop, web, or mobile app and ensure a device is active. *(Tip: Play and pause a track manually if the API fails to detect your device right away).*

3. **Start the Server:**
   ```bash
   pnpm start
   # or node index.js
   ```

4. **Authorize & Play:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000/login
   ```
   Log in and authorize the application. The service will automatically parse `songs.txt`, resolve the track URIs, and inject them straight into your active player!

---

## 🔍 Troubleshooting

* **`NO_ACTIVE_DEVICE` Error:** Make sure your Spotify app is open and you have played a track recently so Spotify registers an active playback session.
* **Song Not Found:** If a track fails to resolve, check your `songs.txt` formatting. Adding the artist name next to the song title usually resolves ambiguous searches.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).