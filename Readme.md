
# Prepify – AI-Powered Interview & Study Assistant

Prepify is a full-stack AI platform that helps students and job-seekers prepare for interviews, study smarter with AI-powered notes, and test themselves with auto-generated quizzes. It combines voice-based mock interviews, PDF chat, and resume analysis into one seamless experience.

---

## 🚀 Features

### 🎤 AI Mock Interviews
- Real-time voice conversations powered by **Vapi AI**
- Dynamic questions adapted to your job role, experience level, and difficulty
- Automatic transcript saving and end-of-call summaries

### 📄 Smart Notes & PDF Chat
- Upload PDFs and chat with them using **RAG (Retrieval-Augmented Generation)**
- Documents are chunked, embedded, and stored in **ChromaDB** for fast vector search
- Full chat history with persistent sessions

### 📝 Resume-Based Quizzes
- Upload your resume and get 10 MCQs auto-generated from it
- Powered by **Groq LLM** with strict formatting rules
- Instant scoring with explanations for each answer

### 📊 Performance Dashboard
- Track your yearly activity streaks
- View feedback scores and weak area analysis
- Skill radar charts based on interview performance

### 🔐 Authentication
- Secure sign up / sign in with **Argon2 hashing** and **JWT tokens**
- Protected routes for all user-specific features

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | FastAPI, SQLAlchemy (async), Pydantic |
| **Database** | SQLite (local dev) / PostgreSQL (production) |
| **Vector Store** | ChromaDB |
| **AI/LLM** | Groq, Vapi AI, SentenceTransformers, LlamaIndex |
| **3D** | Spline (Interactive 3D Robot) |

---

## 📦 Project Structure

```
prepify/
├── Backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Auth, Notes, Interview, Quiz routes
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schema/             # Pydantic schemas
│   │   ├── config.py           # Settings from .env
│   │   ├── database.py         # Async DB engine
│   │   ├── main.py             # FastAPI app with lifespan
│   │   └── llm.py              # LLM integration
│   ├── requirements.txt
│   └── run.py
│
├── Frontend/
│   ├── src/
│   │   ├── pages/              # Home, Dashboard, Notes, Interview, Quiz
│   │   ├── components/         # Auth, Dashboard widgets, UI components
│   │   ├── api/                # Axios API client
│   │   └── routes/             # Protected route wrapper
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── .env                        # Environment variables (not committed)
├── docker-compose.yml          # Docker orchestration
└── Readme.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/shiva12140/propears.git
cd propears
```

### 2. Set up the Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r Backend/requirements.txt
```

### 3. Create your `.env` file

```env
DATABASE_URL=sqlite+aiosqlite:///./student.db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

APP_NAME=Prepify
APP_VERSION=1.0.0

chroma_host=localhost
chroma_port=8080
chroma_collection=prepify_collection

GROQ_API_KEY=your-groq-api-key
VAPI_ASSISTANT_ID=your-vapi-assistant-id
VAPI_PRIVATE_KEY=your-vapi-private-key
VAPI_PUBLIC_KEY=your-vapi-public-key
```

Copy the `.env` to the Backend folder as well:
```bash
cp .env Backend/.env
```

### 4. Start ChromaDB

```bash
source venv/bin/activate
chroma run --host 0.0.0.0 --port 8080 --path /tmp/chroma_store
```

### 5. Start the Backend

```bash
source venv/bin/activate
cd Backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Set up and Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

### 7. Open in Browser

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🐳 Docker Setup (Production)

```bash
docker-compose up --build
```

This starts PostgreSQL, ChromaDB, Backend, and Frontend (via Nginx) together.

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Create a new account |
| POST | `/api/v1/auth/login` | Login and get JWT token |
| GET | `/api/v1/notes/` | List uploaded PDFs |
| POST | `/api/v1/notes/upload` | Upload a PDF |
| POST | `/api/v1/notes/chat` | Chat with a PDF |
| POST | `/api/v1/interview/api/get-vapi-config` | Get interview config |
| POST | `/api/v1/quiz/generate` | Generate quiz from resume |

---

## 📄 License

This project is licensed under the MIT License.

---

### Built with ❤️ by Shiva & Adi
