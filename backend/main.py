import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db.database import init_db

settings = get_settings()

# importing routes :
from auth.routes import router as auth_router
from webhooks.github_pr import router as webhook_router

# Langchain Tracing :
os.environ["LANGCHAIN_TRACING_V2"] = str(settings.LANGCHAIN_TRACING_V2).lower()
os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT

# Lifespan :
@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting up {settings.APP_NAME} v{settings.APP_VERSION}")

    #init db :
    await init_db()
    print("Database initialized.. Tables created..")
    yield

    print(f"Shutting down {settings.APP_NAME} v{settings.APP_VERSION}")

# Fastapi App Initialization
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    # description=settings.DEBUG,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcheck Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app":settings.APP_NAME,
        "version":settings.APP_VERSION
    }

# Include Routers
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(webhook_router, prefix="/webhooks", tags=["Webhooks"])