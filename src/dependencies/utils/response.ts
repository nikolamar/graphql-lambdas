import { assert, ERROR_MESSAGES, ERROR_CODES } from "./errors";

export function response (statusCode, body) {
  const bodyResponse = typeof body === "string" ? body : JSON.stringify(body);
  return { statusCode, body: bodyResponse };
}

export function parseBody(event) {
  const body = event?.body;
  assert(body, ERROR_MESSAGES.HTTP_BODY_REQUIRED, ERROR_CODES.INVALID_INPUT);
  try {
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
}
