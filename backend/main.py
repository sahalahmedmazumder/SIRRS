
from datetime import date
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="SIRRS API",
    description="Smart Issue Reporting and Resolution System",
    version="1.0.0",
)

# Allow the React development server to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Priority = Literal["High", "Medium", "Low"]
IssueStatus = Literal["Open", "In Progress", "Resolved"]


class IssueCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=5, max_length=2000)
    location: str = Field(min_length=2, max_length=150)
    priority: Priority = "Medium"


class Issue(IssueCreate):
    id: str
    status: IssueStatus
    created_at: date


# Temporary sample data. PostgreSQL will replace this later.
issues: list[Issue] = [
    Issue(
        id="SIR-1042",
        title="Projector not working",
        category="IT & Equipment",
        description="The classroom projector is not turning on.",
        location="Classroom 302",
        priority="High",
        status="In Progress",
        created_at=date.today(),
    ),
    Issue(
        id="SIR-1041",
        title="Broken classroom chair",
        category="Maintenance",
        description="A chair in the classroom needs repair.",
        location="Building A",
        priority="Medium",
        status="Open",
        created_at=date.today(),
    ),
]


@app.get("/")
def root():
    return {
        "message": "Welcome to the SIRRS API",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SIRRS API",
    }


@app.get("/api/issues", response_model=list[Issue])
def get_issues():
    return issues


@app.post(
    "/api/issues",
    response_model=Issue,
    status_code=status.HTTP_201_CREATED,
)
def create_issue(issue_data: IssueCreate):
    new_issue = Issue(
        id=f"SIR-{uuid4().hex[:8].upper()}",
        title=issue_data.title,
        category=issue_data.category,
        description=issue_data.description,
        location=issue_data.location,
        priority=issue_data.priority,
        status="Open",
        created_at=date.today(),
    )

    issues.insert(0, new_issue)
    return new_issue


@app.get("/api/issues/{issue_id}", response_model=Issue)
def get_issue(issue_id: str):
    for issue in issues:
        if issue.id == issue_id:
            return issue

    raise HTTPException(
        status_code=404,
        detail="Issue not found",
    )
