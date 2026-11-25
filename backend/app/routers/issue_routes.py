
from fastapi import APIRouter, Depends, status

from app.auth.dependencies import get_current_user

from app.schemas.issue_schema import (
    IssueCreate,
    IssueResponse,
    IssueStatusUpdate
)

from app.services.issue_service import (
    get_all_issues,
    create_issue,
    update_issue_status
)


router = APIRouter(
    prefix="/api/issues",
    tags=["Issues"]
)


@router.get("/", response_model=list[IssueResponse])
def get_issues(
    current_user: dict = Depends(get_current_user)
):
    """Retrieve issues based on the logged-in user's role."""

    return get_all_issues(current_user)


@router.post(
    "/",
    response_model=IssueResponse,
    status_code=status.HTTP_201_CREATED
)
def report_issue(
    issue_data: IssueCreate,
    current_user: dict = Depends(get_current_user)
):
    """Submit a new issue."""

    return create_issue(
        issue_data=issue_data,
        current_user=current_user
    )


@router.patch("/{issue_id}/status")
def update_status(
    issue_id: str,
    status_data: IssueStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Allow assigned Staff members to update issue status."""

    return update_issue_status(
        issue_id=issue_id,
        new_status=status_data.status,
        current_user=current_user
    )
