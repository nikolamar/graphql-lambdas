import { parseBody } from "/opt/utils/response";
import { response } from "/opt/utils/response";
import { ping } from "./ping";
import { message } from "./message";
import { connection } from "./connection";
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

  return response(200, "default");
};
