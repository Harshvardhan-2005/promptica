# Promptica 🚀

A full-stack AI chat application powered by OpenAI GPT, built with the MERN stack. Features real-time streaming responses, persistent chat history, user authentication, and light/dark mode.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, React Markdown  
**Backend:** Node.js, Express.js, MongoDB + Mongoose, OpenAI SDK  
**Auth:** JWT + bcrypt  
**Hosting:** Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

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
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

### 2. Set up environment variables

**Backend** — create `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/promptica
JWT_SECRET=some_random_secret_string_here
OPENAI_API_KEY=sk-...your-openai-key...
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```
VITE_API_URL=
```
(Leave blank for local — Vite proxies `/api` to `localhost:5000` automatically)

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

### Step 1 — MongoDB Atlas (free)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create free account
2. Create a new **free cluster** (M0)
3. Click **Connect** → **Connect your application** → copy the URI
4. Replace `<password>` in the URI with your DB user password
5. Save the URI — you'll need it for Render

### Step 2 — Deploy Backend to Render (free)

1. Push your code to GitHub
2. Go to [https://render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Set the following:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add these **Environment Variables**:
   ```
   MONGO_URI=<your MongoDB Atlas URI>
   JWT_SECRET=<random 32+ char string>
   OPENAI_API_KEY=<your OpenAI API key>
   CLIENT_URL=<your Vercel URL — add after step 3>
   ```
6. Deploy. Copy the generated URL (e.g. `https://promptica-api.onrender.com`)

> ⚠️ Free Render services spin down after inactivity. First request may take ~30s to wake up.

### Step 3 — Deploy Frontend to Vercel (free)

1. Go to [https://vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
4. Add **Environment Variable**:
   ```
   VITE_API_URL=https://your-backend-render-url.onrender.com
   ```
5. Deploy. Copy the Vercel URL.

### Step 4 — Update CORS on backend

Go back to Render → your service → **Environment** → update:
```
CLIENT_URL=https://your-app.vercel.app
```
Redeploy. ✅

---

## Features

- **Real-time streaming** — SSE-based streaming from OpenAI, token by token
- **Multi-model** — Switch between GPT-4o, GPT-4o Mini, GPT-3.5 Turbo
- **Auth** — Register/login with JWT tokens, passwords hashed with bcrypt
- **Chat history** — All conversations saved to MongoDB, resume any chat
- **Delete chats** — Remove conversations from history
- **Light/Dark mode** — Preference saved to localStorage
- **Markdown rendering** — AI responses render with full markdown support
- **Responsive** — Works on mobile and desktop

---

## Getting an OpenAI API Key

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up / log in
3. Go to **API Keys** → Create new secret key
4. Copy and save it (you won't see it again)
5. Add billing info (GPT-4o-mini is very cheap — ~$0.15/1M tokens)

---

## License

MIT
