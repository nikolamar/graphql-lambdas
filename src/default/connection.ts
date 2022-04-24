import { sendMessage } from "/opt/websocket";
import { parseBody, response } from "/opt/response";

export async function connection (event) {
  const myConnectionId = event?.requestContext?.connectionId;
  const { route } = parseBody(event);

  await sendMessage(myConnectionId, route, { message: myConnectionId });

  return response(200, "my connection");
}