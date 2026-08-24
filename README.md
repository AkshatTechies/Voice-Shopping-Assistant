# 🎙️ Voice Shopping Assistant

A voice-first shopping list app. Speak naturally — *"add two milk and a bread"*, *"remove bread"*, *"find toothpaste under ₹200"* — and your list updates itself. Includes smart substitute suggestions, restock reminders, and a catalog you can browse and add from directly.

> Built as an end-to-end learning project covering speech-to-text, LLM-based intent parsing, vector search, and a full-stack app with auth.

---

## ✨ Features

- **Voice commands** — tap the mic, speak, and the app adds/removes/searches items for you
- **Manual add** — type an item directly if you'd rather not use voice
- **Smart substitutes** — semantic search suggests alternatives for any list item (e.g. Almond Milk / Eggs for Milk)
- **Restock suggestions** — flags items you're likely running low on, based on your purchase history and typical repurchase cycle
- **Catalog browsing** — search and filter the full product catalog by category, add straight to your list
- **Auth & profiles** — signup/login (JWT), saved addresses, payment methods, and preferences
- **Session persistence** — stay logged in across refreshes

---

## 🧠 How it works

```
Voice input (browser mic)
    → Whisper (speech-to-text)
    → LLM (Groq: openai/gpt-oss-20b) — extracts structured intent + entities as JSON
    → FastAPI backend — executes the action (add/remove/search) against the shopping list
    → Postgres — stores lists, purchase history, and the product catalog
    → Chroma + sentence-transformers — semantic search for substitute suggestions
```

The same backend action layer (`/api/list`) is shared between voice commands and manual typed input, so both paths stay in sync.

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Framer Motion, Zustand |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Vector store | Chroma + sentence-transformers |
| Speech-to-text | Whisper |
| Intent parsing | Groq (`openai/gpt-oss-20b`) |
| Auth | JWT (bcrypt + python-jose) |
| Hosting (planned) | Frontend → Vercel/Netlify · Backend → Render/Railway · DB → Supabase/Firebase |

---

## 📁 Project structure

```
voice-shopping-assistant/
├── backend/
│   ├── app/
│   │   ├── routes/          # list, voice, parse, search, suggestions, auth, profile
│   │   ├── services/        # restock_service, suggestion logic
│   │   ├── db/               # database.py, models.py
│   │   └── auth.py
│   ├── seed_catalog.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/       # Catalog, CartPage, ShoppingList, ListItem, MicButton, etc.
        ├── store/             # useAppStore.js (Zustand)
        └── api/               # client.js
```

---

## 🚀 Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
Requires `ffmpeg` on your PATH for Whisper audio processing.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment variables
Create a `.env` in `backend/` with:
```
DATABASE_URL=your_postgres_connection_string
GROQ_API_KEY=your_groq_key
JWT_SECRET=your_jwt_secret
```

---

## 📡 Key API endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/voice` | Upload audio, returns transcript |
| `POST /api/parse` | Parse transcript into structured intent, executes on the list |
| `GET/POST/PUT/DELETE /api/list` | CRUD for the shopping list |
| `GET /api/search` | Search list + purchase history |
| `GET /api/suggestions/{item}` | Semantic substitute suggestions |
| `GET /api/restock-suggestions` | Items likely due for restock |
| `POST /api/auth/*` | Signup/login |
| `GET/PUT /api/profile` | Addresses, payment methods, preferences |

---

## 🗺️ Status

- [x] Backend CRUD + DB models
- [x] Voice pipeline (Whisper → LLM parsing → list actions)
- [x] Substitute suggestions (vector search)
- [x] Restock suggestions
- [x] Text search
- [x] Auth (JWT) + profile page
- [x] Session persistence
- [x] Catalog browsing with category filters
- [x] Dedicated cart page
- [ ] Voice Commands page (in progress)
- [ ] Automated testing
- [ ] Production deployment


