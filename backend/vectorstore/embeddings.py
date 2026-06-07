from langchain_cohere import CohereEmbeddings
from config import get_settings

settings = get_settings()

# Cohere embeddings — used for storing and searching docs in Qdrant
embeddings = CohereEmbeddings(
    cohere_api_key=settings.COHERE_API_KEY,
    model=settings.COHERE_EMBED_MODEL,
)