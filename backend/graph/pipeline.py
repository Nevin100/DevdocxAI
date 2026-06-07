from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from graph.state import DevDocState
from graph.hitl import hitl_review_node, should_publish
from config import get_settings

settings = get_settings()

# Placeholder nodes
async def codebase_parser_node(state: DevDocState) -> dict:
    """Phase 4 — AST-level parsing of GitHub repo"""
    return {"current_step": "codebase_parser"}


async def doc_generator_node(state: DevDocState) -> dict:
    """Phase 4 — LLM generates docs per module"""
    return {"current_step": "doc_generator"}


async def brave_researcher_node(state: DevDocState) -> dict:
    """Phase 4 — Enriches docs with external context via Brave Search"""
    return {"current_step": "brave_researcher"}


async def doc_publisher_node(state: DevDocState) -> dict:
    """Phase 4 — Saves docs to DB and Qdrant vector store"""
    return {"current_step": "doc_publisher", "completed": True}


async def pr_watcher_node(state: DevDocState) -> dict:
    """Phase 5 — Triggered by GitHub PR merge webhook"""
    return {"current_step": "pr_watcher"}


async def onboarding_chatbot_node(state: DevDocState) -> dict:
    """Phase 4 — RAG chatbot for new devs (runs parallel)"""
    return {"current_step": "onboarding_chatbot"}


# Build the graph 
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

# Parallel chatbot graph
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


# Compile graphs with PostgreSQL checkpointer 
async def get_compiled_pipeline():
    """
    Compile the doc pipeline with PostgresSaver checkpointer.
    PostgresSaver saves state after every node — enables HITL pause/resume.
    """
    async with await AsyncPostgresSaver.from_conn_string(
        settings.DATABASE_URL.replace("+asyncpg", "")  
    ) as checkpointer:
        await checkpointer.setup()  

        doc_graph = build_doc_pipeline().compile(
            checkpointer=checkpointer,
            interrupt_before=["human_review"],  
        )

        chatbot_graph = build_chatbot_pipeline().compile(
            checkpointer=checkpointer
        )

        return doc_graph, chatbot_graph

# Run helpers
async def run_pipeline(state: DevDocState, doc_graph):
    """
    Start a new pipeline run.
    Graph will pause at human_review node automatically.
    """
    config = {"configurable": {"thread_id": state.thread_id}}

    async for event in doc_graph.astream(state.model_dump(), config=config):
        node_name = list(event.keys())[0]
        print(f" Node complete: {node_name}")

    return config

async def resume_pipeline(thread_id: str, review_status: str, dev_notes: str, doc_graph):
    """
    Resume pipeline after human approves/rejects.
    Called from the HITL API endpoint.
    """
    config = {"configurable": {"thread_id": thread_id}}

    # Inject human decision into the paused graph
    doc_graph.update_state(
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
        print(f"Resumed node: {node_name}")