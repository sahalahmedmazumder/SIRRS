
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.config import (
    JWT_SECRET,
    JWT_ALGORITHM,
    ACCESS_TOKEN_MINUTES
)

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a password securely."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: str, role: str) -> str:
    """Generate a JWT access token."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_MINUTES
    )

    payload = {
        "sub": user_id,
        "role": role,
        "exp": expires_at
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    return jwt.decode(
        token,
        JWT_SECRET,
        algorithms=[JWT_ALGORITHM]
    )
