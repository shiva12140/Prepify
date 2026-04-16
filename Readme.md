
<p align="center">
  <img src="Gemini_Generated_Image_flv9lqflv9lqflv9.jpg" width="600" />
</p>

# PrepAI – Intelligent Interview & Notes Assistant

PrepAI is a comprehensive AI-powered platform designed to help users prepare for interviews, generate personalized quizzes, manage study notes, and even participate in real-time mock interviews using conversational AI. It blends multiple modern technologies such as FastAPI, React, ChromaDB, PostgreSQL, Vapi, Groq, and LlamaIndex into a cohesive, production-ready system.

---

## 🎬 Demo Video

▶ **Watch the demo:** [https://youtu.be/WFycdZQijyA?si=aumRW2hEyBNleGGI](https://youtu.be/WFycdZQijyA?si=aumRW2hEyBNleGGI)

---

## 🚀 Live Demo

▶ **Try the project here:** [https://huggingface.co/spaces/aki-008/prepAI](https://huggingface.co/spaces/aki-008/prepAI)

---

## 🚀 Overview

PrepAI enables users to:

* Conduct **AI-powered mock interviews** with real-time voice interaction.
* Upload PDFs and **chat with notes** using vector search + RAG.
* Generate **MCQ quizzes** from resumes or study material.
* Maintain persistent **chat sessions**, interview transcripts, and summaries.
* Work inside a fully containerized architecture with isolated services.

This system is ideal for interview preparation platforms, ed-tech tools, or personal study automation.

---

## 🧩 Architecture

PrepAI is built with a modular full-stack architecture:

### **Backend (FastAPI)**

* JWT Authentication
* Upload & process PDFs
* ChromaDB vector store integration
* Streaming LLM responses
* Vapi-powered live interview assistant
* Quiz generation using Groq/OpenAI

### **Frontend (React + TypeScript + Vite)**

* User onboarding (Sign In / Sign Up)
* PDF upload, preview, rename, deletion
* Interactive note-chat interface
* Dashboard with metrics
* Seamless Vapi interview client

### **Database Layer**

* **PostgreSQL** stores:

  * Users
  * PDFs
  * Chat sessions
  * Messages
  * Metadata

### **Vector Search Layer**

* **ChromaDB** stores:

  * Chunked PDF embeddings
  * User-ingested knowledge

### **AI Services**

* **Groq/OpenAI** for LLM responses
* **SentenceTransformers** for embeddings
* **Vapi** for real-time voice conversations
* **LlamaIndex** for PDF parsing & chunking

---

## 📦 Directory Structure

```
aki-008-prepai/
├── Backend/
│   ├── app/
│   ├── Dockerfile
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   ├── Dockerfile
│   └── vite.config.ts
│
├── docker-compose.yml
└── RUN.md
```

---

## ⚙️ Installation & Setup

### **1. Clone the repository**

```
git clone <repo-url>
cd aki-008-prepai
```

### **2. Create your `.env` file**

Provide:

* PostgreSQL credentials
* Groq API key
* OpenAI key (if needed)
* VAPI_PRIVATE_KEY
* VAPI_PUBLIC_KEY
* VAPI_ASSISTANT_ID

Example:

```
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/studentdb
GROQ_API_KEY=your-key
VAPI_PRIVATE_KEY=your-key
VAPI_PUBLIC_KEY=your-key
VAPI_ASSISTANT_ID=your-assistant-id
```

### **3. Run the system (Docker)**

```
docker-compose up --build
```

Services started:

* Frontend → [http://localhost:5173](http://localhost:5173)
* Backend → [http://localhost:8000](http://localhost:8000)
* ChromaDB → [http://localhost:8080](http://localhost:8080)
* PostgreSQL → [http://localhost:5432](http://localhost:5432)

### **4. Dev mode (manual)**

Backend:

```
cd Backend
python run.py
```

Frontend:

```
cd Frontend
npm install
npm run dev
```

ChromaDB:

```
chroma run --host 0.0.0.0 --port 8080 --path ./chroma_store
```

---

## 🧪 Key Features in Detail

### **1. PDF Upload & Notes Chat**

* PDFs are chunked using PyMuPDF + LlamaIndex.
* Embeddings generated via MiniLM.
* Chunks stored in ChromaDB.
* Users can open chats tied to each PDF with full chat history.

### **2. AI Interview System**

* Dynamic prompt generation based on job-role, experience, difficulty.

* Real-time Vapi-based interview with:

  * Emotion recognition
  * Adjustable voice
  * Adaptive follow-ups
  * Strict 5-minute flow

* Transcripts saved automatically.

### **3. Quiz Generation**

From resumes or notes:

* Strict rules enforced by the SYSTEM_PROMPT
* Always 10 MCQs with 4 options
* JSON-structured output
* Options + explanations

### **4. Authentication**

* Secure hashing using Argon2
* JWT tokens
* Protected routes for all user-specific actions

---

## 🛠️ Development Notes

### **Backend**

* Powered by **FastAPI** with async SQLAlchemy.
* Auto-table creation on startup.
* Organized into clear routers: Auth, Notes, Interview, Quiz.
* Streaming responses for chat.

### **Frontend**

* Built on **React + TypeScript**.
* Modern UI with Tailwind.
* Routes include: Home, Dashboard, Notes, Interview.
* ProtectedRoute ensures authentication.

### **Docker Setup**

`docker-compose.yml` orchestrates:

* PostgreSQL database
* ChromaDB vector server
* Backend (Python)
* Frontend (Nginx)

---

## 📄 Interview Transcript Storage

During every interview:

* All real-time transcripts are appended in `Backend/transcripts/<call_id>.txt`.
* Summary is appended at end of call.

---

## 🚧 Roadmap

Future improvements:

* User analytics dashboard
* Multi-file knowledge merging
* Advanced scoring for interview responses
* Multi-voice model selector
* Mobile-friendly front-end layout

---

## 🧑‍💻 Contributing

Feel free to open issues or submit pull requests. Contributions are welcome for both frontend and backend.

---

## 📜 License

This project is licensed under your chosen license (MIT recommended).

---

### ❤️ Thank you for using PrepAI!

If you'd like additional documentation (API reference, UML diagrams, onboarding guide), just ask!
