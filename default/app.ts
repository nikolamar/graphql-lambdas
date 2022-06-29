import { parseBody } from "/opt/utils/response";
import { ping } from "./ping";
import { message } from "./message";
import { connection } from "./connection";

export async function handler(event) {
  const { route } = parseBody(event);

  switch (route) {
    case "ping":
      ping(event);
      break;

    case "connection":
      connection(event);
      break;

    case "message":
      message(event);
      break;
  }
}
