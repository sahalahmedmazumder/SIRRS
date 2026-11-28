
from fastapi import HTTPException, status

from app.services.user_service import get_user_by_email
from app.auth.security import verify_password, create_access_token


def login_user(email: str, password: str):
    """Authenticate a user and generate an access token."""

    user = get_user_by_email(email.strip().lower())

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    access_token = create_access_token(
        user_id=user["user_id"],
        role=user["role"]
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_flagged": user.get("is_flagged", False)
        }
    }
