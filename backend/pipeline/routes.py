from fastapi import APIRouter, Depends
import uuid

from auth.jwt import get_current_user
from schemas.pipeline_schemas import PipelineStateResponse, ReviewRequest, ReviewResponse
from services.pipeline_service import PipelineService

router = APIRouter()

@router.get("/pipeline/{thread_id}/state", response_model=PipelineStateResponse)
async def get_pipeline_state(
    thread_id: str,
    user_id: uuid.UUID = Depends(get_current_user),
):
    return await PipelineService.get_state(thread_id)


@router.post("/pipeline/review", response_model=ReviewResponse)
async def submit_review(
    body: ReviewRequest,
    user_id: uuid.UUID = Depends(get_current_user),
):
    return await PipelineService.submit_review(body)