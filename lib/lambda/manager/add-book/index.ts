import { Handler } from 'aws-lambda';
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";

const documentClient = DynamoDBDocument.from(new DynamoDB({}));

export const handler: Handler = async (event, context) => {
  // Setup the parameters
  const req = JSON.parse(event.body);
  const createdTime = new Date().getTime();
  const params = {
    TableName: process.env.DDB_TABLE_NAME,
    Item: {
      id: context.awsRequestId,
      title: req.title,
      author: req.author,
      isbn: req.isbn,
      publicationYear: req.publicationYear,
      genre: req.genre,
      description: req.description,
      createdAt: createdTime,
      updatedAt: createdTime,
    }
  };

  // Add the item to the database
  try {
    const res = await documentClient.send(new PutCommand(params));
    return {
      statusCode: 200,
      isBase64Encoded: false,
      body: JSON.stringify({
        message: 'Book item created successfully',
        book: {
          id: context.awsRequestId,
          title: req.title,
          author: req.author,
          isbn: req.isbn,
          publicationYear: req.publicationYear,
          genre: req.genre,
          description: req.description,
          createdAt: createdTime,
          updatedAt: createdTime,
        },
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
  catch (err) {
    return {
      statusCode: 500,
      isBase64Encoded: false,
      body: JSON.stringify({ error: 'Failed to create book item', details: err }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}