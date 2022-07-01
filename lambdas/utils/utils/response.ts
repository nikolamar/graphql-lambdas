import { assert, ERROR_MESSAGES, ERROR_CODES } from "./errors";
import type { APIGatewayProxyEvent } from "aws-lambda";

export function response(statusCode: number, body: any) {
  const bodyResponse = typeof body === "string" ? body : JSON.stringify(body);
  return { statusCode, body: bodyResponse };
}

export function parseBody(event: APIGatewayProxyEvent) {
  const body: any = event?.body;
  assert(body, ERROR_MESSAGES.HTTP_BODY_REQUIRED, ERROR_CODES.INVALID_INPUT);
  try {
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
}
