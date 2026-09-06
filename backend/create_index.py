import asyncio
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PayloadSchemaType
from config import get_settings

settings = get_settings()
async def main():
    client = AsyncQdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
    await client.create_payload_index(
        collection_name=settings.QDRANT_COLLECTION_NAME,
        field_name="repo_id",
        field_schema=PayloadSchemaType.KEYWORD,
    )
    print("✅ Index created on repo_id")
    await client.close()

asyncio.run(main())