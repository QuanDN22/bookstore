import { Handler } from 'aws-lambda';
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, GetCommand } from "@aws-sdk/lib-dynamodb";

const documentClient = DynamoDBDocument.from(new DynamoDB({}));

export const handler: Handler = async (event) => {
  // Extract bookId from pathParameters
  const { bookId } = event.pathParameters;

  // Setup the parameters for getting the item
  const params = {
    TableName: process.env.DDB_TABLE_NAME, // DynamoDB table name
    Key: {
      id: bookId, // Using the bookId from pathParameters
    },
  };

  try {
    // Perform the get operation
    const res = await documentClient.send(new GetCommand(params));

    if (!res.Item) {
      // Book not found
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Book with ID ${bookId} not found` }),
      };
    }

    // Book found
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Book retrieved successfully',
        book: res.Item, // Return the book details
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (err) {
    console.error('Error retrieving book:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error retrieving book', details: err }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};
