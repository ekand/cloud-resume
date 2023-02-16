import json
import boto3


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('visits-table')
    response = table.get_item(
        Key={
            'id': 'website',
        }
    )
    item = response['Item']
    x = item['number_of_visits']
    return {
        'statusCode': 200,
        'body': json.dumps({"visits": str(x)})
    }
