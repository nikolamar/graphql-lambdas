import { sendMessage } from "/opt/websocket";
import { parseBody, response } from "/opt/response";

export async function ping (event) {
  const myConnectionId = event?.requestContext?.connectionId;
  const { route } = parseBody(event);

  await sendMessage(myConnectionId, route, { message: "pong" });

  return response(200, "ping pong");
}