# Promptica ⚡

A full-stack AI chat application built using the MERN stack (MongoDB, Express, React, Node.js) and powered by Groq AI (free). The app allows users to have real-time conversations with an AI assistant, where responses are streamed instantly for a smooth chat experience. It includes user authentication for secure login, persistent chat history so conversations are saved and can be accessed later, and a light/dark mode option for a better user interface. Overall, it demonstrates how modern web technologies and AI can be combined to create a responsive and user-friendly chat platform.

![Promptica](https://img.shields.io/badge/AI-Groq%20%E2%9A%A1-38bdf8?style=flat-square) ![Stack](https://img.shields.io/badge/Stack-MERN-0ea5e9?style=flat-square) ![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, React Markdown  
**Backend:** Node.js, Express.js, MongoDB + Mongoose  
**Auth:** JWT + bcrypt  
**AI:** Groq API (free) — Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B  
**Hosting:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

---

## Features

- ⚡ **Real-time streaming** — SSE-based token-by-token streaming via Groq
- 🤖 **Multi-model** — Switch between Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B
- 🔐 **Auth** — Register/login with JWT tokens, passwords hashed with bcrypt
- 💾 **Chat history** — All conversations saved to MongoDB, resume any chat
- 🗑️ **Delete chats** — Remove conversations from history
- 🌙 **Light/Dark mode** — Preference saved to localStorage
- 📝 **Markdown rendering** — AI responses render with full markdown support
- 📱 **Responsive** — Works on mobile and desktop

---

## Project Structure

```
promptica/
├── backend/
│   ├── index.js
│   ├── models/
│   │   ├── User.js
│   │   └── Chat.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── history.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Chat.jsx
    │   │   ├── History.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    └── package.json
```

---

## Local Development

### 1. Clone & install

```bash
# Clone the repo
git clone https://github.com/your-username/promptica.git
cd promptica

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (new terminal)
cd ../frontend
npm install
```

### 2. Set up environment variables

**Backend** — create `backend/.env`:

```
MONGO_URI=mongodb://localhost:27017/promptica
JWT_SECRET=some_random_secret_string_here
GROQ_API_KEY=gsk_...your_groq_api_key...
PORT=5001
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:

```
VITE_API_URL=
```

Leave blank for local development — Vite proxies `/api` to `localhost:5001` automatically.

### 3. Run both servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## Deployment

### Step 1 — Get a free Groq API key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up with Google
3. Click **API Keys** → **Create API Key**
4. Copy the key — it starts with `gsk_...`

> 💡 Groq is completely free — no billing required. Llama 3.3 70B is faster than GPT-4o.

### Step 2 — MongoDB Atlas (free)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Create a new **free cluster** (M0)
3. Go to **Database Access** → Add a database user with a password
4. Go to **Network Access** → Allow access from anywhere (`0.0.0.0/0`)
5. Click **Connect** → **Drivers** → copy the URI
6. Replace `<password>` with your DB user password and add `/promptica` before the `?`

### Step 3 — Deploy Backend to Render (free)

1. Push your code to GitHub
2. Go to [https://render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo and configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Instance Type:** Free
4. Add these **Environment Variables**:
   ```
   MONGO_URI=<your MongoDB Atlas URI>
   JWT_SECRET=<random 32+ char string>
   GROQ_API_KEY=<your gsk_... key>
   PORT=5001
   CLIENT_URL=<your Vercel URL — add after step 4>
   ```
5. Deploy and copy the generated URL (e.g. `https://promptica-backend-xxxx.onrender.com`)

> ⚠️ Free Render services spin down after 15 min of inactivity. First request after sleep takes ~30s.

### Step 4 — Deploy Frontend to Vercel (free)

1. Go to [https://vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
4. Add **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-render-url.onrender.com
   ```
5. Deploy and copy your Vercel URL

### Step 5 — Update CORS on Render

Go to Render → your service → **Environment** → update:

```
CLIENT_URL=https://your-app.vercel.app
```

Save and redeploy. ✅

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `MONGO_URI`    | MongoDB Atlas connection string           |
| `JWT_SECRET`   | Any long random string for signing tokens |
| `GROQ_API_KEY` | Your Groq API key (starts with `gsk_`)    |
| `PORT`         | Port to run the server on (use `5001`)    |
| `CLIENT_URL`   | Your frontend URL for CORS                |

### Frontend (`frontend/.env`)

| Variable       | Description                                   |
| -------------- | --------------------------------------------- |
| `VITE_API_URL` | Your Render backend URL (blank for local dev) |

---

## Available AI Models

| Model         | Speed   | Best For                       |
| ------------- | ------- | ------------------------------ |
| Llama 3.3 70B | Fast    | General use, complex reasoning |
| Llama 3.1 8B  | Fastest | Quick answers, simple tasks    |
| Mixtral 8x7B  | Fast    | Coding, technical questions    |

---

## Common Issues

| Error                        | Fix                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `MongoDB connection error`   | Check `MONGO_URI` — ensure password is correct and `/promptica` is in the URI |
| `CORS error`                 | Update `CLIENT_URL` on Render to match your exact Vercel URL                  |
| `404 on API calls`           | Check `VITE_API_URL` on Vercel points to your Render URL                      |
| `Groq model not found`       | Make sure model name is one of the three valid Groq models                    |
| Backend sleeping (30s delay) | Normal on free Render tier — first request wakes it up                        |

---

## Pushing Updates

Any time you update code, just run:

```bash
git add .
git commit -m "your update message"
git push
```

Render and Vercel both auto-redeploy from GitHub. ✅

---

## License

MIT
