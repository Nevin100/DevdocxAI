from fastapi import APIRouter, Depends
import uuid

from auth.jwt import get_current_user
from schemas.chat_schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService

router = APIRouter()

@router.post("/chat/ask", response_model=ChatResponse)
async def ask_chatbot(
    body: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user),
):
    return await ChatService.ask(body)