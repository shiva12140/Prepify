import os
from app.models import User
import uvicorn
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from app.config import settings
from vapi import Vapi
from dotenv import load_dotenv
from app.api.deps import get_db, get_current_user, get_chroma_collection

load_dotenv()

router = APIRouter()

# --- CONFIGURATION ---
VAPI_PRIVATE_KEY = os.getenv("VAPI_PRIVATE_KEY")
VAPI_ASSISTANT_ID = os.getenv("VAPI_ASSISTANT_ID")
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:8000") 

# Initialize Vapi Server SDK
try:
    vapi_server = Vapi(token=VAPI_PRIVATE_KEY)
except Exception as e:
    print(f"Vapi SDK Initialization Error: {e}")
    print("Ensure VAPI_PRIVATE_KEY is set in .env")

# --- SCHEMAS ---
class ConfigRequest(BaseModel):
    name: str
    job_role: str
    experience: str
    level: str = "Medium"
    # Optional customizable fields
    model_name: str = "gpt-4o" 
    voice_provider: str = "11labs"
    voice_id: str = "burt" 

# --- ENDPOINTS ---

@router.post("/api/get-vapi-config")
async def get_vapi_config(data: ConfigRequest):
    """
    Endpoint called by the Frontend to get the dynamically generated Assistant configuration.
    """
    if not VAPI_ASSISTANT_ID:
        raise HTTPException(
            status_code=503, 
            detail="VAPI_ASSISTANT_ID not configured in .env."
        )

    try:
        print(f"\n--- New Interview Request ---")
        print(f"👤 User: {data.name}, Role: {data.job_role}, Exp: {data.experience}, Level: {data.level}")

        system_prompt = (
            f"You are the hiring manager at a tech company. You are conducting a strict 5-minute screening interview "
            f"with {data.name} for a {data.job_role} role. The candidate has {data.experience} years of experience. "
            f"The difficulty level is {data.level}. Your style is clear, concise, and professional. Do not lecture. "
            "All questions must be relevant to the provided job role.\n\n"

            "You MUST strictly follow this interview flow:\n\n"

            "1. **Introduction**: You have already welcomed them. Wait for their confirmation to begin.\n\n"

            "2. **Background Snapshot**: Ask: "
            "'Give me a brief 30–40 second overview of your background and the type of work you've done related to this role.'\n\n"

            "3. **Technical Depth**: Ask the candidate to choose one project relevant to the job role. "
            "Ask: 'Pick one project you're proud of that aligns with this role. In under a minute, explain the problem, your approach, "
            "tools or techniques used, and the business impact.'\n\n"

            "4. **Core Skills Check**: Inform them you will ask 3 rapid questions tailored to the job. "
            "Generate **three crisp, role-specific skill checks** following this logic:\n"
            "   - Question 1: A foundational concept essential to the role.\n"
            "   - Question 2: A practical troubleshooting or decision-making question.\n"
            "   - Question 3: A tool, framework, or technology familiarity question.\n"
            "Questions must be specific to the given job role.\n\n"

            "5. **Practical Scenario**: Generate **one short applied scenario** relevant to the role. "
            "Ask the candidate to describe their high-level approach to solve it.\n\n"

            "6. **Role & Communication Fit**: Ask a communication-focused question, such as: "
            "'This role requires cross-team collaboration. Can you give an example where you explained something complex "
            "to a non-technical or differently-skilled stakeholder?'\n\n"

            "7. **Wrap-Up**: Say: 'Thank you. Any questions for me?' Then conclude: 'We’ll get back to you with next steps.'\n\n"

            "**CRITICAL RULES:**\n"
            "- Do NOT exceed the boundaries of each segment.\n"
            "- If their answers run long, politely interrupt and move forward.\n"
            "- Keep your phrasing tight and professional.\n"
            "- All generated questions MUST be directly relevant to the specified job role."
        )



        webhook_url = f"{SERVER_URL}/api/webhook"

        assistant_overrides = {

            "model": {
                "provider": "openai", 
                "model": data.model_name,
                "temperature": 0.3, 
                "maxTokens": 150,   
                "emotionRecognitionEnabled": True, 
                "messages": [
                    {"role": "system", "content": system_prompt}
                ]
            },

            "voice": {
                "provider": data.voice_provider,
                "voiceId": data.voice_id,
                "speed": 1.1, 
                "stability": 0.5
            },

            "firstMessage": f"Hi {data.name}, thanks for joining. I’m the hiring manager. This is a quick 5-minute screening to understand your background and fit. Shall we begin?",
            "maxDurationSeconds": 360, 
            "silenceTimeoutSeconds": 40, 
            "backgroundSound": "office", 
            "backgroundDenoisingEnabled": True,

            "endCallPhrases": [
                "Goodbye",
                "Have a great day",
                "We’ll get back to you with next steps",
                "Thank you for your time"
            ],

            # --- SERVER ---
            "server": {
                "url": webhook_url
            },
            "metadata": {
                "user_name": data.name,
                "job_role": data.job_role,
                "environment": "production_screening"
            }
        }

        return {
            "assistantId": VAPI_ASSISTANT_ID,
            "overrides": assistant_overrides
        }

    except Exception as e:
        print(f"❌ Vapi Configuration Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to configure agent: {str(e)}")


@router.post("/api/webhook")
async def vapi_webhook_receiver(request: Request):
    """
    Endpoint that receives asynchronous events from Vapi's servers.
    Saves transcripts to a local file.
    """
    payload = await request.json()
    message = payload.get("message", {})
    call_id = payload.get("call", {}).get("id", "unknown_call")
    
    os.makedirs("transcripts", exist_ok=True)

    if message.get("type") == "transcript" and message.get("transcriptType") == "final":
        transcript_text = message.get('transcript')
        role = message.get('role', 'unknown')

        try:
            with open(f"transcripts/{call_id}.txt", "a", encoding="utf-8") as f:
                f.write(f"{role.upper()}: {transcript_text}\n")
            print(f"🗣️ [Saved] {role.upper()}: {transcript_text}")
        except Exception as e:
            print(f"❌ Error saving transcript: {e}")

    elif message.get("type") == "end-of-call-report":
        metadata = payload.get("assistant", {}).get("metadata", {})
        summary = message.get('summary', 'N/A')
        
        # Save summary to the same file
        try:
            with open(f"transcripts/{call_id}.txt", "a", encoding="utf-8") as f:
                f.write(f"\n--- SUMMARY ---\n{summary}\n")
        except Exception as e:
            print(f"❌ Error saving summary: {e}")

        print(f"\n--- 🏁 Call Ended Report ---")
        print(f"  User: {metadata.get('user_name')}")
        print(f"  Summary: {summary}")
        print(f"---------------------------\n")

    return {"status": "ok"}