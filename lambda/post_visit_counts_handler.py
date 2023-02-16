import json
import boto3


headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
}


def lambda_handler(event, context):
    if event["httpMethod"] == "OPTIONS":
        return {"statusCode": 200, "headers": headers}
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('visits-table')
    response = table.get_item(
        Key={
            'id': 'website',
        }
    )
    item = response['Item']
    x = item['number_of_visits']
    x += 1
    response2 = table.update_item(
        Key={
            'id': 'website',
        },
        UpdateExpression='SET number_of_visits = :val1',
        ExpressionAttributeValues={
            ':val1': x
        }
    )
    return {
        'statusCode': 200,
        'body': json.dumps({"visits": str(x)})
    }
