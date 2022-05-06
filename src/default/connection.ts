import { sendMessage } from "/opt/utils/websocket";
import { parseBody, response } from "/opt/utils/response";

export async function connection (event) {
  const myConnectionId = event?.requestContext?.connectionId;
  const { route } = parseBody(event);

  await sendMessage(myConnectionId, route, { message: myConnectionId });

  return response(200, "my connection");
}