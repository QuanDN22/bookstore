import { Handler } from 'aws-lambda';
import { DynamoDB, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { Book } from '../models/book';

const documentClient = DynamoDBDocument.from(new DynamoDB({}));

export const handler: Handler = async (event, context) => {
  try {
    // Fetch all books from the DynamoDB table
    const { Items } = await documentClient.send(new ScanCommand({
      TableName: process.env.DDB_TABLE_NAME
    }));

    // If no books found
    if (!Items || Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'No books found' })
      };
    }

    // Parse items to match the Book model
    const books = Items.map(item => ({
      id: item.id.S,
      title: item.title.S,
      author: item.author.S,
      isbn: item.isbn.S,
      publicationYear: item.publicationYear?.N ? parseInt(item.publicationYear.N) : 0,
      genre: item.genre.S,
      description: item.description?.S,
      createdAt: item.createdAt.S,
      updatedAt: item.updatedAt.S,
    }));

    // Return the books
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      isBase64Encoded: false,
      body: JSON.stringify(books)
    };
  } catch (error) {
    console.error('Error fetching books from DynamoDB:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};