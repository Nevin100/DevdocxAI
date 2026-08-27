from pydantic import BaseModel


class PipelineStateResponse(BaseModel):
    thread_id: str
    current_step: str
    review_status: str
    generated_docs: list[dict]
    completed: bool


class ReviewRequest(BaseModel):
    thread_id: str
    review_status: str   # "approved" | "rejected"
    dev_notes: str = ""


class ReviewResponse(BaseModel):
    status: str
    thread_id: str