from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from graph.state import DevDocState
from graph.hitl import hitl_review_node, should_publish
from agents.codebase_parser import codebase_parser_node
from agents.doc_generator import doc_generator_node
from agents.brave_researcher import brave_researcher_node
from agents.doc_publisher import doc_publisher_node
from agents.onboarding_chatbot import onboarding_chatbot_node
from config import get_settings

settings = get_settings()

# Main doc pipeline
def build_doc_pipeline() -> StateGraph:
    """
    Main documentation pipeline graph.

    Flow:
    START → codebase_parser → doc_generator → brave_researcher
          → HITL checkpoint → doc_publisher → END

    HITL conditional:
      approved → doc_publisher
      rejected → doc_generator (retry with dev feedback)
    """
    builder = StateGraph(DevDocState)

    # Add all nodes
    builder.add_node("codebase_parser", codebase_parser_node)
    builder.add_node("doc_generator", doc_generator_node)
    builder.add_node("brave_researcher", brave_researcher_node)
    builder.add_node("human_review", hitl_review_node)
    builder.add_node("doc_publisher", doc_publisher_node)

    # Fixed edges — always follow this order
    builder.add_edge(START, "codebase_parser")
    builder.add_edge("codebase_parser", "doc_generator")
    builder.add_edge("doc_generator", "brave_researcher")
    builder.add_edge("brave_researcher", "human_review")

    # Conditional edge after HITL — approved or rejected
    builder.add_conditional_edges(
        "human_review",
        should_publish,
        {
            "doc_publisher": "doc_publisher",
            "doc_generator": "doc_generator",   
            "__end__": END,
        }
    )

    builder.add_edge("doc_publisher", END)
    return builder

# Parallel chatbot pipeline 
def build_chatbot_pipeline() -> StateGraph:
    """
    Onboarding chatbot — runs independently from the doc pipeline.
    Answers new dev questions using RAG over the vector store.
    """
    builder = StateGraph(DevDocState)
    builder.add_node("onboarding_chatbot", onboarding_chatbot_node)
    builder.add_edge(START, "onboarding_chatbot")
    builder.add_edge("onboarding_chatbot", END)
    return builder

# Compile with PostgreSQL checkpointer
_checkpointer_cm = None
_checkpointer = None

async def get_compiled_pipeline():
    global _checkpointer_cm, _checkpointer

    if _checkpointer is None:
        psycopg_url = (
            settings.DATABASE_URL
            .replace("postgresql+asyncpg://", "postgresql://")
            .replace("?ssl=require", "?sslmode=require")
        )

        _checkpointer_cm = AsyncPostgresSaver.from_conn_string(psycopg_url)
        _checkpointer = await _checkpointer_cm.__aenter__()
        await _checkpointer.setup()

    doc_graph = build_doc_pipeline().compile(
        checkpointer=_checkpointer,
        interrupt_before=["human_review"],
    )

    chatbot_graph = build_chatbot_pipeline().compile(
        checkpointer=_checkpointer
    )

    return doc_graph, chatbot_graph

# Run helpers 
async def run_pipeline(state: DevDocState, doc_graph):
    """
    Start a new pipeline run.
    Graph will auto-pause at human_review node.
    Returns config (contains thread_id for resuming later).
    """
    config = {"configurable": {"thread_id": state.thread_id}}

    async for event in doc_graph.astream(state.model_dump(), config=config):
        node_name = list(event.keys())[0]
        print(f"Node complete: {node_name}")

    return config

async def resume_pipeline(thread_id: str, review_status: str, dev_notes: str, doc_graph):
    """
    Resume pipeline after human approves or rejects docs.
    Called from the HITL API endpoint when dev clicks approve/reject.
    """
    config = {"configurable": {"thread_id": thread_id}}

    # Inject human decision into the paused graph state
    doc_graph.aupdate_state(
        config,
        {
            "review_status": review_status,
            "dev_notes": dev_notes,
        },
        as_node="human_review"
    )

    # Resume from where it paused
    async for event in doc_graph.astream(None, config=config):
        node_name = list(event.keys())[0]
        print(f" Resumed node: {node_name}")