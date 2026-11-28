
import os
import boto3

from app.config import AWS_REGION, DYNAMODB_TABLE_NAME

# Connect to AWS DynamoDB
dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION
)

# Existing table for issue records
table = dynamodb.Table(DYNAMODB_TABLE_NAME)

# Separate table for user records
USER_TABLE_NAME = os.getenv(
    "DYNAMODB_USER_TABLE_NAME",
    "SIRRSuser"
)

user_table = dynamodb.Table(USER_TABLE_NAME)
