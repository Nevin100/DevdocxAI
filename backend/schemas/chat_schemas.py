from pydantic import BaseModel

class ChatRequest(BaseModel):
    repo_id: str
    chat_query: str

class ChatResponse(BaseModel):
    chat_response: str