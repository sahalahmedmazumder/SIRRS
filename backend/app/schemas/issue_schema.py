
from pydantic import BaseModel, Field
from typing import Literal


class IssueCreate(BaseModel):
    title: str = Field(min_length=3, max_length=150)
    category: str = Field(min_length=2, max_length=100)
    description: str = Field(min_length=10, max_length=2000)

    location: str = Field(min_length=2, max_length=200)
    priority: Literal["High", "Medium", "Low"] = "Medium"


class IssueResponse(BaseModel):
    issue_id: str
    title: str
    category: str
    description: str
    location: str
    priority: Literal["High", "Medium", "Low"]
    status: Literal["Open", "In Progress", "Resolved"]
    reporter_id: str
    assigned_to: str | None = None
    created_at: str

class IssueStatusUpdate(BaseModel):
    status: Literal["In Progress", "Resolved"]

class AssignIssueRequest(BaseModel):
    staff_id: str = Field(min_length=1)
