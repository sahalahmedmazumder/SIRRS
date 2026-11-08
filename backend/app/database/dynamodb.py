
import boto3

from app.config import AWS_REGION, DYNAMODB_TABLE_NAME

dynamodb = boto3.resource(
    "dynamodb",
    region_name=AWS_REGION
)

table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def check_database_connection():
    response = dynamodb.meta.client.describe_table(
        TableName=DYNAMODB_TABLE_NAME
    )

    return response["Table"]["TableStatus"] == "ACTIVE"
