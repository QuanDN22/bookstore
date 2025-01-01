import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {
  HttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";

import { ApiGatewayToLambda, ApiGatewayToLambdaProps } from '@aws-solutions-constructs/aws-apigateway-lambda';
import {
  LambdaToDynamoDB
} from '@aws-solutions-constructs/aws-lambda-dynamodb';

export class BookstoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Existing Resources
    // Create a DynamoDB table to store metadata for the books
    const booksTable = new dynamodb.Table(this, 'BooksTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const readScaling = booksTable.autoScaleReadCapacity({
      minCapacity: 1,
      maxCapacity: 50,
    });
    
    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 50,
    });

    booksTable.addGlobalSecondaryIndex({
      partitionKey: {
        name: "gsi1pk",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "gsi1sk",
        type: dynamodb.AttributeType.STRING,
      },
      indexName: "gsi1pk-gsi1sk-index",
    });

    // // Create a S3 bucket to store images of the books
    // const booksBucket = new s3.Bucket(this, 'BooksBucket', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY
    // });

    // 
    // Create a Lambda function that lists all books in the database
    const getAllBooks = new LambdaToDynamoDB(this, 'get-all-books', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("./dist/lib/lambda/manager/get-all-books"),
        handler: 'index.handler',
        timeout: cdk.Duration.seconds(15)
      },
      existingTableObj: booksTable,
    });

    const getBookById = new LambdaToDynamoDB(this, 'get-book-by-id', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("./dist/lib/lambda/manager/get-book-by-id"),
        handler: 'index.handler',
        timeout: cdk.Duration.seconds(15)
      },
      existingTableObj: booksTable,
    });

    const addBook = new LambdaToDynamoDB(this, 'add-book', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("./dist/lib/lambda/manager/add-book"),
        handler: 'index.handler',
        timeout: cdk.Duration.seconds(15)
      },
      existingTableObj: booksTable,
    });

    const deleteBookById = new LambdaToDynamoDB(this, 'delete-book-by-id', {
      lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset("./dist/lib/lambda/manager/delete-book"),
        handler: 'index.handler',
        timeout: cdk.Duration.seconds(15)
      },
      existingTableObj: booksTable,
    })

    const bookStoreApi = new ApiGatewayToLambda(this, 'BookStoreApi', {
      existingLambdaObj: getAllBooks.lambdaFunction,
      apiGatewayProps: {
        proxy: false,
        defaultMethodOptions: {
          authorizationType: apigateway.AuthorizationType.NONE,
        },
      }
    });

    // Add a resource to the API for getting all books
    const booksResource = bookStoreApi.apiGateway.root.addResource('books');
    const bookIdResource = booksResource.addResource('{bookId}');

    // api
    booksResource.addMethod(HttpMethod.GET, new apigateway.LambdaIntegration(getAllBooks.lambdaFunction))
    bookIdResource.addMethod(HttpMethod.GET, new apigateway.LambdaIntegration(getBookById.lambdaFunction));
    booksResource.addMethod(HttpMethod.POST, new apigateway.LambdaIntegration(addBook.lambdaFunction));
    bookIdResource.addMethod(HttpMethod.DELETE, new apigateway.LambdaIntegration(deleteBookById.lambdaFunction));
  }
}
