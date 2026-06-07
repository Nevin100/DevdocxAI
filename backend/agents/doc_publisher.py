import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from graph.state import DevDocState
from db.models import Document, DocStatus
from vectorstore.qdrant_store import store_document
from db.database import AsyncSessionLocal

# This node is responsible for taking the enriched docs from the previous step and saving them to the database and vector store. It checks if a doc already exists for the given file path and repo, and either updates it or creates a new entry. After saving to the database, it also stores the document in Qdrant and saves the resulting vector ID back to the database.
async def doc_publisher_node(state: DevDocState) -> dict:
    """
    LangGraph node — saves approved docs to PostgreSQL and Qdrant.

    Steps:
    1. For each enriched doc
    2. Save to Document table with status=PUBLISHED
    3. Embed and store in Qdrant
    4. Return published_doc_ids and vector_ids
    """
    print(f"📤 Publishing {len(state.enriched_docs)} docs")

    published_doc_ids = []
    vector_ids = []

    async with AsyncSessionLocal() as db:
        for doc in state.enriched_docs:
            # Check if doc already exists for this file (update) or create new
            result = await db.execute(
                select(Document).where(
                    Document.repo_id == uuid.UUID(state.repo_id),
                    Document.file_path == doc["file_path"],
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                # Update existing doc
                existing.content = doc["content"]
                existing.status = DocStatus.PUBLISHED
                existing.dev_notes = state.dev_notes or None
                db_doc = existing
            else:
                # Create new doc
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

            # Store in Qdrant vector store
            vector_id = await store_document(
                doc_id=str(db_doc.id),
                content=doc["content"],
                metadata={
                    "file_path": doc["file_path"],
                    "module_name": doc["module_name"],
                    "repo_id": state.repo_id,
                }
            )

            # Save vector ID back to DB
            db_doc.vector_id = vector_id

            published_doc_ids.append(str(db_doc.id))
            vector_ids.append(vector_id)
            print(f"Published: {doc['file_path']}")

        await db.commit()

    return {
        "published_doc_ids": published_doc_ids,
        "vector_ids": vector_ids,
        "current_step": "doc_publisher",
        "completed": True,
    }