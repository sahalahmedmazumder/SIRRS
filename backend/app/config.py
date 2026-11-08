
import os

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE_NAME", "SIRRS")

JWT_SECRET = os.getenv("SIRRS_SECRET_KEY")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60

if not JWT_SECRET:
    raise RuntimeError(
        "SIRRS_SECRET_KEY environment variable is missing."
    )