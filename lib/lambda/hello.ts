import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
    const httpMethod = event.httpMethod;

    switch (httpMethod) {
        case 'GET':
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Fetched list of books' }),
            };

        case 'POST':
            const body = JSON.parse(event.body || '{}');
            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Book added', data: body }),
            };

        default:
            return {
                statusCode: 400,
                body: JSON.stringify({ error: `Unsupported method: ${httpMethod}` }),
            };
    }
};
