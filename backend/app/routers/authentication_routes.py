
from fastapi import APIRouter

from app.schemas.authentication_schema import (
    LoginRequest,
    LoginResponse
)

from app.services.auth_service import login_user


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest):
    return login_user(
        email=str(login_data.email),
        password=login_data.password
    )
