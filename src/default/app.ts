import { parseBody } from "/opt/response";
import { LambdaResolver } from "/opt/lambda";
import { ROUTES } from "/opt/websocket";
import { ping } from "./ping";
import { message } from "./message";
import { connection } from "./connection";

export function handler (event) {
  return new LambdaResolver(event)
    .match(event => {
      const { route } = parseBody(event);
      return route;
    })
    .add(ROUTES.PING, ping)
    .add(ROUTES.CONNECTION, connection)
    .add(ROUTES.MESSAGE, message)
    .resolve();
}
