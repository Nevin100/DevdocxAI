import uuid
from sqlalchemy import select

from graph.state import DevDocState
from db.models import Document, DocStatus, Repository, RepoStatus
from vectorstore.qdrant_store import store_document
from db.database import async_session_local


async def doc_publisher_node(state: DevDocState) -> dict:
    """
    LangGraph node — saves approved docs to PostgreSQL and Qdrant.

    Steps:
    1. For each enriched doc
    2. Save to Document table with status=PUBLISHED
    3. Embed and store in Qdrant
    4. Mark the Repository as completed with a last_parsed_at timestamp
       so the dashboard reflects the real last-run state
    5. Return published_doc_ids and vector_ids
    """
    print(f"📤 Publishing {len(state.enriched_docs)} docs")

    published_doc_ids = []
    vector_ids = []

    async with async_session_local() as db:
        for doc in state.enriched_docs:
            result = await db.execute(
                select(Document).where(
                    Document.repo_id == uuid.UUID(state.repo_id),
                    Document.file_path == doc["file_path"],
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                existing.content = doc["content"]
                existing.status = DocStatus.PUBLISHED
                existing.dev_notes = state.dev_notes or None
                db_doc = existing
            else:
                db_doc = Document(
                    id=uuid.UUID(doc["doc_id"]),
                    repo_id=uuid.UUID(state.repo_id),
                    file_path=doc["file_path"],
                    module_name=doc["module_name"],
                    content=doc["content"],
                    status=DocStatus.PUBLISHED,
                    dev_notes=state.dev_notes or None,
                )
                db.add(db_doc)

            await db.flush()

            vector_id = await store_document(
                doc_id=str(db_doc.id),
                content=doc["content"],
                metadata={
                    "file_path": doc["file_path"],
                    "module_name": doc["module_name"],
                    "repo_id": state.repo_id,
                }
            )

            db_doc.vector_id = vector_id

            published_doc_ids.append(str(db_doc.id))
            vector_ids.append(vector_id)
            print(f"✅ Published: {doc['file_path']}")

        # Mark the repo itself as completed with a fresh timestamp —
        # this is what makes the dashboard show "Docs live" and
        # "Last parsed X ago" instead of "Waiting for first run".
        repo_result = await db.execute(
            select(Repository).where(Repository.id == uuid.UUID(state.repo_id))
        )
        repo = repo_result.scalar_one_or_none()
        if repo:
            repo.status = RepoStatus.COMPLETED
            from datetime import datetime
            repo.last_parsed_at = datetime.utcnow()

        await db.commit()

    return {
        "published_doc_ids": published_doc_ids,
        "vector_ids": vector_ids,
        "current_step": "doc_publisher",
        "completed": True,
    }