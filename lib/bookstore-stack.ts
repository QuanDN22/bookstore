import { Construct } from 'constructs';
import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as api from 'aws-cdk-lib/aws-apigateway';
import { ApiGatewayToLambda, ApiGatewayToLambdaProps } from '@aws-solutions-constructs/aws-apigateway-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { LambdaToDynamoDB, LambdaToDynamoDBProps } from '@aws-solutions-constructs/aws-lambda-dynamodb';

export class BookstoreStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const helloFunc = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('./dist/lib/lambda'),
      handler: 'hello.handler'
    });

    const lambda_ddb_props: LambdaToDynamoDBProps = {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lib/lambda'),
        handler: 'hitcounter.handler',
        environment: {
          DOWNSTREAM_FUNCTION_NAME: helloFunc.functionName,
        }
      },
      dynamoTableProps: {
        tableName: 'SolutionsConstructsHits',
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
        removalPolicy: RemovalPolicy.DESTROY
      }
    }
    
    const hitcounter = new LambdaToDynamoDB(this, 'LambdaToDynamoDB', lambda_ddb_props);
    // grant the hitcounter lambda role invoke permissions to the hello function
    helloFunc.grantInvoke(hitcounter.lambdaFunction);

    const api_lambda_props: ApiGatewayToLambdaProps = {
      existingLambdaObj: hitcounter.lambdaFunction,
      apiGatewayProps: {
        proxy: false,
        defaultMethodOptions: {
          authorizationType: api.AuthorizationType.NONE
        }
      }
    };

    const apiGatewayToLambda = new ApiGatewayToLambda(this, 'ApiGatewayToLambda', api_lambda_props);

    const booksResource = apiGatewayToLambda.apiGateway.root.addResource('books');
    booksResource.addMethod('GET');
    booksResource.addMethod('POST');

  }
}
