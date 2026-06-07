from langgraph.types import interrupt
from graph.state import DevDocState

# HITL Node : 
def hitl_review_node(state: DevDocState) -> dict:
    """
    This node pauses the graph and waits for human approval.

    How it works:
    1. Graph reaches this node → pauses automatically
    2. Frontend shows generated docs to the dev
    3. Dev approves or rejects via API
    4. Graph resumes with updated review_status

    The interrupt() call is what causes the graph to pause.
    LangGraph saves the full state to PostgreSQL checkpointer.
    """

    # Pause here — wait for human input
    # Whatever value is passed to graph.invoke(None, config) after
    # update_state() will be available as the return of interrupt()
    human_input = interrupt({
        "message": "Docs generated. Please review and approve or reject.",
        "generated_docs": state.generated_docs,
        "repo": state.repo_full_name,
    })

    # human_input comes from:
    # graph.update_state(config, {"review_status": "approved", "dev_notes": "looks good"})
    review_status = human_input.get("review_status", "pending")
    dev_notes = human_input.get("dev_notes", "")

    return {
        "review_status": review_status,
        "dev_notes": dev_notes,
        "current_step": "hitl_complete",
    }


def should_publish(state: DevDocState) -> str:
    """
    Conditional edge after HITL — decides next node based on review.

    approved → go to doc_publisher
    rejected → go to doc_generator (regenerate)
    anything else → end
    """
    if state.review_status == "approved":
        return "doc_publisher"
    elif state.review_status == "rejected":
        return "doc_generator"   
    else:
        return "__end__"