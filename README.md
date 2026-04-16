# 🎧 Vibe AI – AI Music Recommendation Engine

Discover music through AI.  
Generate highly relevant song recommendations, refine them conversationally, and instantly turn them into a Spotify playlist.

---

## 🚀 Demo

![App Demo](./assets/demo.gif)

---

## ✨ Features

- 🎵 **AI-powered recommendations**
  - Input any song (e.g. *"The Weeknd - Blinding Lights"*)
  - Get **20 highly relevant tracks**

- 🧠 **Conversational refinement**
  - Refine results naturally:
    - "darker"
    - "more synthwave"
    - "less mainstream"
    - "female vocals"
  - Session-aware context (remembers previous state)

- 🔗 **YouTube integration**
  - One-click search for every recommended song

- 🎼 **Spotify playlist creation**
  - Instantly create a playlist with all recommended tracks
  - Automatic matching via Spotify API

- 🎨 **Modern UI**
  - Clean dark design
  - AI loading animation with typing effect
  - Smooth UX and transitions

---

## 🧠 How It Works

1. User inputs a song  
2. Gemini AI:
   - Detects song & artist
   - Understands vibe, mood, production
   - Generates 20 similar tracks + playlist name  
3. User can refine results conversationally  
4. App optionally creates a Spotify playlist  

---

## 🏗 Architecture

Frontend (React + Vite)
↓
Backend (Node.js + Express)
↓
Gemini API (AI recommendations)
↓
Spotify API (playlist creation)


---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- CSS (custom + Tailwind-inspired styling)

### Backend
- Node.js
- Express
- Zod (validation)

### APIs
- Google Gemini API
- Spotify Web API

---

## 📦 Project Structure

music-ai-gemini-only/
├── src/ # Backend
│ ├── services/
│ ├── routes/
│ ├── session/
│ ├── utils/
│ └── index.js
│
├── vibe-ai-ui/ # Frontend
│ ├── src/
│ ├── index.css
│ └── App.jsx
│
├── .env
└── README.md


---

## ⚙️ Setup

### 1. Clone repo

```bash
git clone https://github.com/your-username/vibe-ai.git
cd vibe-ai
```

### 2. Backend setup

```bash
npm install
npm run server
```

### 3. Frontend setup

```bash
cd vibe-ai-ui
npm install
npm run dev
```

### 4. Environment variables

Create .env in root:
```env
GEMINI_API_KEY=your_key_here

SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
```
---

## 🔌 API Endpoints

### POST /recommend

```json
{
  "query": "The Weeknd - Blinding Lights"
}
```

### POST /refine

```json
{
  "refinement": "darker, more synthwave"
}
```

### POST /playlist

Creates Spotify playlist from current session.

---

## 🎯 Key Highlights

- AI-first product design (not just API wrapper)
- Session-based conversational refinement
- Real-world integrations (Spotify)
- Clean UX with loading states and feedback
- Fully functional end-to-end system

---

## 🔮 Future Improvements

- Real YouTube video embedding (not just search)
- User accounts & saved playlists
- Deploy (Vercel + Render)
- Mobile app (React Native)
- Better recommendation ranking (hybrid AI + API)

---

## 👤 Author

Built by Konstantinos Tsaousidis

---

## 📜 License

MIT