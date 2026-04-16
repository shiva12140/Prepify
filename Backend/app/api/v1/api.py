from fastapi import APIRouter
from app.api.v1.endpoints import auth, quiz, notes, interview

api_router = APIRouter()

# Include authentication routes
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

# Include quiz routes
api_router.include_router(
    quiz.router,
    prefix="/quiz",
    tags=["quiz"]
)

# Include notes routes
api_router.include_router(
    notes.router,
    prefix="/notes",
    tags=["notes"]
)

api_router.include_router(
    interview.router,
    prefix="/interview",
    tags=["Interview"]
)