import json
import boto3


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('visits')
    response = table.get_item(
        Key={
            'record_id': 'website',
        }
    )
    item = response['Item']
    x = item['number_of_visits']
    return {
        'statusCode': 200,
        'body': json.dumps(f'number of visits on website: {x}')
    }
