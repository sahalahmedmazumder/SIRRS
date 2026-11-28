
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import authentication_routes
from app.routers import user_routes
from app.routers import admin_user_routes
from app.routers import issue_routes
from app.routers import admin_issue_routes


app = FastAPI(
    title="SIRRS API",
    description="Smart Issue Reporting and Resolution System",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(authentication_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_user_routes.router)
app.include_router(issue_routes.router)
app.include_router(admin_issue_routes.router)


@app.get("/")
def home():
    return {"message": "SIRRS API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
