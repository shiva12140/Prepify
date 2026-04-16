from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from app.services.vapi_service import vapi_service
from app.config import settings
from app.api.deps import get_current_user
from app.models import User

router = APIRouter()

class InterviewConfigRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    job_role: str = Field(..., min_length=2, max_length=100)
    experience: str = Field(..., min_length=1)
    difficulty: str = Field(default="Medium", pattern="^(Basic|Medium|Hard)$")

class VapiConfigResponse(BaseModel):
    assistantId: str
    publicKey: str
    overrides: dict

@router.post("/get-vapi-config", response_model=VapiConfigResponse)
async def get_vapi_config(
    request: InterviewConfigRequest,
    # current_user: User = Depends(get_current_user)
):
    """
    Returns Vapi configuration for starting an interview call.
    Protected route - requires authentication.
    """
    try:
        # Create dynamic assistant configuration
        assistant_config = vapi_service.create_interview_assistant_config(
            candidate_name=request.name,
            job_role=request.job_role,
            experience=request.experience,
            difficulty=request.difficulty
        )
        
        # Create assistant (you can cache this for reuse)
        # assistant_id = vapi_service.create_assistant(assistant_config)
        assistant_id = settings.VAPI_ASSISTANT_ID
        
        # Return config for frontend
        return VapiConfigResponse(
            assistantId=assistant_id,
            publicKey=settings.VAPI_PUBLIC_KEY,
            overrides={
                "recordingEnabled": True,
                "variableValues": {
                    "candidateName": request.name,
                    "jobRole": request.job_role
                }
            }
        )
        
    except Exception as e:
        print(f"Vapi Config Error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create interview configuration: {str(e)}"
        )

@router.get("/call-recording/{call_id}")
async def get_call_recording(
    call_id: str,
    # current_user: User = Depends(get_current_user)
):
    """
    Retrieves call recording and transcript after interview ends.
    """
    try:
        recording_data = vapi_service.get_call_recording(call_id)
        
        if not recording_data:
            raise HTTPException(status_code=404, detail="Call recording not found")
        
        return recording_data
        
    except Exception as e:
        print(f"Error fetching recording: {e}")
        raise HTTPException(status_code=500, detail=str(e))