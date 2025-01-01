import { DynamoDB } from '@aws-sdk/client-dynamodb'; // Use the modular v3 SDK
import { Lambda } from '@aws-sdk/client-lambda'; // Use the modular v3 SDK
import { Handler } from 'aws-lambda'; // Keep this as-is for Lambda handler typing

export const handler: Handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB({});
  const lambda = new Lambda({});

  try {
    // update DynamoDB entry for "path" with hits++
    const params = {
      TableName: process.env.DDB_TABLE_NAME!,
      Key: { path: { S: event.path } }, // Ensure event.path is a string
      UpdateExpression: 'ADD hits :incr',
      ExpressionAttributeValues: { ':incr': { N: '1' } }, // Increment hits by 1
    };

    await dynamo.updateItem(params);
    console.log('DynamoDB update successful.');
  } catch (error) {
    console.error('Error updating DynamoDB:', error);
    throw new Error('DynamoDB update failed.');
  }

  try {
    // call downstream function and capture response
    const invokeParams = {
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME!,
      Payload: JSON.stringify(event),
    };

    const resp = await lambda.invoke(invokeParams);
    console.log('downstream response:', JSON.stringify(resp, undefined, 2));

    // return response back to upstream caller
    // Decode from Uint8Array to string
    const payloadString = new TextDecoder('utf-8').decode(resp.Payload);
    // Now you can safely parse the JSON string
    return JSON.parse(payloadString);
  } catch (error) {
    console.error('Error invoking downstream function:', error);
    throw new Error('Downstream Lambda invocation failed.');
  }
};
