import { sendMessage } from "/opt/utils/websocket";
import { parseBody, response } from "/opt/utils/response";
import type { APIGatewayProxyEvent } from "aws-lambda";

export async function connection(event: APIGatewayProxyEvent) {
  const myConnectionId = event?.requestContext?.connectionId as string;
  const { route } = parseBody(event);

  await sendMessage(myConnectionId, route, { message: myConnectionId });

  return response(200, "my connection");
}
