import { Stack, StackProps } from "aws-cdk-lib";

import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigateway";

import { Construct } from "constructs";

export class CloudResumeBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a new DynamoDB table
    const table = new dynamodb.Table(this, "VisitsTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      tableName: "visits-table",
    });

    // Create a new IAM role with DynamoDB read permissions
    const role = new iam.Role(this, "MyLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    table.grantReadWriteData(role);
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["arn:aws:logs:*:*:*"],
      })
    );

    // Create a new Lambda function
    const getVisitCountsHandler = new lambda.Function(
      this,
      "GetVisitCountsHandler",
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        code: lambda.Code.fromAsset("lambda"),
        handler: "get_visit_counts_handler.lambda_handler",
        role: role,
      }
    );

    const postVisitCountsHandler = new lambda.Function(
      this,
      "PostVisitCountsHandler",
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        code: lambda.Code.fromAsset("lambda"),
        handler: "post_visit_counts_handler.lambda_handler",
        role: role,
      }
    );

    // Create a new API Gateway REST API
    const api = new apigateway.RestApi(this, "MyAPI", {
      restApiName: "My API",
      description: "An example API to demonstrate AWS CDK",
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    // Create a new resource and method for the API Gateway
    const visits = api.root.addResource("visits");
    const getintegration = new apigateway.LambdaIntegration(
      getVisitCountsHandler
    );
    visits.addMethod("GET", getintegration);
    const postintegration = new apigateway.LambdaIntegration(
      postVisitCountsHandler
    );
    visits.addMethod("POST", postintegration);
  }
}
