
import uuid
from datetime import datetime, timezone

from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError
from fastapi import HTTPException

from app.database.dynamodb import table


def create_issue(issue_data, current_user: dict):
    """Save a new issue in DynamoDB."""

    issue_id = str(uuid.uuid4())

    issue = {
        "PK": f"ISSUE#{issue_id}",
        "SK": "DETAILS",
        "issue_id": issue_id,
        "title": issue_data.title.strip(),
        "category": issue_data.category.strip(),
        "description": issue_data.description.strip(),
        "location": issue_data.location.strip(),
        "priority": issue_data.priority,
        "status": "Open",
        "reporter_id": current_user["user_id"],
        "assigned_to": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    try:
        table.put_item(Item=issue)

        return {
            key: value
            for key, value in issue.items()
            if key not in ["PK", "SK"]
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create issue: {str(error)}"
        )


def get_all_issues(current_user: dict):
    """Retrieve issues according to the authenticated user's role."""

    role = current_user.get("role")
    user_id = current_user.get("user_id")

    if role not in ["Admin", "Staff", "Reporter"]:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view issues."
        )

    try:
        response = table.scan(
            FilterExpression=Attr("SK").eq("DETAILS")
        )

        issues = response.get("Items", [])

        while response.get("LastEvaluatedKey"):
            response = table.scan(
                FilterExpression=Attr("SK").eq("DETAILS"),
                ExclusiveStartKey=response["LastEvaluatedKey"]
            )

            issues.extend(response.get("Items", []))

        if role == "Admin":
            visible_issues = issues

        elif role == "Reporter":
            visible_issues = [
                issue for issue in issues
                if issue.get("reporter_id") == user_id
            ]

        else:
            visible_issues = [
                issue for issue in issues
                if issue.get("assigned_to") == user_id
            ]

        visible_issues.sort(
            key=lambda issue: issue.get("created_at", ""),
            reverse=True
        )

        return [
            {
                key: value
                for key, value in issue.items()
                if key not in ["PK", "SK"]
            }
            for issue in visible_issues
        ]

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve issues: {str(error)}"
        )


def update_issue_status(
    issue_id: str,
    new_status: str,
    current_user: dict
):
    """Allow assigned Staff members to update issue status."""

    if current_user.get("role") != "Staff":
        raise HTTPException(
            status_code=403,
            detail="Only Staff members can update issue status."
        )

    if new_status not in ["In Progress", "Resolved"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid issue status."
        )

    user_id = current_user["user_id"]

    try:
        response = table.update_item(
            Key={
                "PK": f"ISSUE#{issue_id}",
                "SK": "DETAILS"
            },
            UpdateExpression=(
                "SET #status = :status, updated_at = :updated_at"
            ),
            ExpressionAttributeNames={
                "#status": "status"
            },
            ExpressionAttributeValues={
                ":status": new_status,
                ":updated_at": datetime.now(timezone.utc).isoformat()
            },
            ConditionExpression=Attr("assigned_to").eq(user_id),
            ReturnValues="ALL_NEW"
        )

        updated_issue = response["Attributes"]

        return {
            key: value
            for key, value in updated_issue.items()
            if key not in ["PK", "SK"]
        }

    except ClientError as error:
        error_code = error.response["Error"]["Code"]

        if error_code == "ConditionalCheckFailedException":
            raise HTTPException(
                status_code=403,
                detail="Issue not found or not assigned to you."
            )

        raise HTTPException(
            status_code=500,
            detail="Failed to update issue status."
        )
