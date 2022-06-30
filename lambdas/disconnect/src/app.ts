import { getMongodbClient } from "/opt/utils/db";
import { response } from "/opt/utils/response";
import { CHANNELS_COLLECTION } from "/opt/configs/collections";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const myConnectionId = event?.requestContext?.connectionId;

  try {
    const client = await getMongodbClient();
    const collection = client.collection(CHANNELS_COLLECTION);
    const channel = await collection.findOne({
      name: "public",
    });

    if (channel) {
      await collection.updateOne(
        { name: "public" },
        { $pull: { connections: myConnectionId } }
      );
    }
  } catch (e) {
    console.log(e);
  }

  return response(200, "disconnected");
};
