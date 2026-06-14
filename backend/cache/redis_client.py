import json
import redis.asyncio as aioredis
from config import get_settings

settings = get_settings()

# Redis client — reuse across requests
_redis_client = None

async def get_redis() -> aioredis.Redis:
    """Get or create Redis connection"""
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client

async def cache_set(key: str, value: dict, ttl_seconds: int = 3600) -> None:
    """Store a value in Redis with TTL (default 1 hour)"""
    redis = await get_redis()
    await redis.setex(key, ttl_seconds, json.dumps(value))

async def cache_get(key: str) -> dict | None:
    """Get a value from Redis — returns None if not found or expired"""
    redis = await get_redis()
    data = await redis.get(key)
    if data is None:
        return None
    return json.loads(data)

async def cache_delete(key: str) -> None:
    """Delete a key from Redis"""
    redis = await get_redis()
    await redis.delete(key)


async def cache_exists(key: str) -> bool:
    """Check if a key exists in Redis"""
    redis = await get_redis()
    return await redis.exists(key) > 0

# Cache key helpers 
def repo_docs_key(repo_id: str) -> str:
    """Cache key for repo's generated docs"""
    return f"repo:{repo_id}:docs"

def pipeline_status_key(thread_id: str) -> str:
    """Cache key for pipeline run status"""
    return f"pipeline:{thread_id}:status"

def user_repos_key(user_id: str) -> str:
    """Cache key for user's connected repos list"""
    return f"user:{user_id}:repos"