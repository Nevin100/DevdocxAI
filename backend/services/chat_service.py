import uuid
from graph.state import DevDocState
from graph.pipeline import get_compiled_pipeline
from schemas.chat_schemas import ChatRequest, ChatResponse

class ChatService:

    @staticmethod
    async def ask(body: ChatRequest) -> ChatResponse:
        """
        Runs the parallel onboarding_chatbot graph for a one-off question.
        Each question gets its own thread_id — no need to persist chat state
        across requests for a simple Q&A endpoint.
        """
        _, chatbot_graph = await get_compiled_pipeline()

        state = DevDocState(
            repo_id=body.repo_id,
            chat_query=body.chat_query,
            thread_id=str(uuid.uuid4()),
        )

        config = {"configurable": {"thread_id": state.thread_id}}
        result = await chatbot_graph.ainvoke(state.model_dump(), config=config)

        return ChatResponse(chat_response=result.get("chat_response", ""))