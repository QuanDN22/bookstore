import { Handler } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const documentClient = DynamoDBDocument.from(new DynamoDB({ apiVersion: '2012-08-10' }));

export const handler: Handler = async (event) => {
  // Extract bookId from pathParameters
  const { bookId } = event.pathParameters;

  // Setup the parameters for deleting the item
  const params = {
    TableName: process.env.DDB_TABLE_NAME, // DynamoDB table name
    Key: {
      id: bookId, // Using the bookId from pathParameters
    },
  };

  try {
    // Check if the book exists
    const getResult = await documentClient.send(new GetCommand(params));

    // If the book doesn't exist, return a 404 status code
    if (!getResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Book with ID ${bookId} does not exist` }),
      };
    }
    
    // Perform the delete operation
    await documentClient.send(new DeleteCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Book deleted successfully' }),
    };
  } catch (err) {
    console.error('Error deleting book:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error deleting book' }),
    };
  }
};
