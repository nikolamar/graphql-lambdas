import { getMongodbClient } from "/opt/utils/db";
import { sendMessage } from "/opt/utils/websocket";
import { parseBody, response } from "/opt/utils/response";
import { assert, ERROR_MESSAGES, ERROR_CODES } from "/opt/utils/errors";
import { CHANNELS_COLLECTION } from "/opt/configs/collections";
import type { APIGatewayProxyEvent } from "aws-lambda";

export async function message(event: APIGatewayProxyEvent) {
  const myConnectionId = event?.requestContext?.connectionId;
  const { route, message, channel, connections } = parseBody(event);

  assert(message, ERROR_MESSAGES.MESSAGE_REQUIRED, ERROR_CODES.INVALID_INPUT);
  assert(channel, ERROR_MESSAGES.CHANNEL_REQUIRED, ERROR_CODES.NOT_FOUND);

  const failedConnections = [];

  for (const connection of connections) {
    if (connection !== myConnectionId) {
      try {
        await sendMessage(connection, route, { message, channel });
      } catch (e) {
        failedConnections.push(connection);
      }
    }
  }

  if (failedConnections.length) {
    try {
      const client = await getMongodbClient();
      const collection = client.collection(CHANNELS_COLLECTION);
      const dbChannel = await collection.findOne({ name: channel });

      if (dbChannel) {
        await collection.updateOne(
          { name: channel },
          { $pull: { connections: { $in: failedConnections } } }
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  return response(200, "message sent");
}
