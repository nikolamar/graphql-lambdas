export const ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  NOT_FOUND: "NOT_FOUND",
  INVALID_INPUT: "INVALID_INPUT",
  CONFLICT: "CONFLICT",
  UNKNOWN: "UNKNOWN",
};

export const ERROR_MESSAGES = {
  ID_TOKEN_REQUIRED: "Cognito ID Token is required",
  TENANT_REQUIRED: "Tenant is required",
  TENANT_ID_REQUIRED: "Tenant id is required",
  USER_REQUIRED: "User is required",
  CHANNEL_REQUIRED: "Channel is required.",
  HTTP_BODY_REQUIRED: "HTTP body required",
  RESOLVER_REQUIRED: "Resolver path is required",
  MESSAGE_REQUIRED: "Message is required",
  CONNECTION_ID_REQUIRED: "ConnectionId is required",
  KID_REQUIRED: "KID is required",
  TOKEN_SECTION_REQUIRED: "Token section is required",
  CLAIM_EXPIRED: "Claim expired",
  CLAIM_REQUIRED_TYPE: "Claim requires type",
  CLAIM_REQUIRED_ISSUER: "Claim requires issuer",
  CLAIM_REQUIRED_TENANT: "Claim requires tenant",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  COGNITO_EMAIL_ALREADY_EXISTS: "Cognito email already exists",
  TENANT_NAME_ALREADY_EXISTS: "Tenant name already exist",
  UNAUTHORIZED_TO_DELETE_USER: "Unauthorized to delete user",
  UNAUTHORIZED_ACTION: "You are not authorized to preform this action",
};

export class DomainError extends Error {
  name;
  code;

  constructor (message, code = ERROR_CODES.UNKNOWN) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    this.code = code;
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends DomainError {
  constructor (message) {
    super(message, ERROR_CODES.NOT_FOUND);
  }
}

export class InvalidInputError extends DomainError {
  constructor (message) {
    super(message, ERROR_CODES.INVALID_INPUT);
  }
}

export class UnauthorizedError extends DomainError {
  constructor (message) {
    super(message, ERROR_CODES.UNAUTHORIZED);
  }
}
export class UnauthenticatedError extends DomainError {
  constructor (message) {
    super(message, ERROR_CODES.UNAUTHENTICATED);
  }
}

export function assert (predicate, message, code) {
  if (predicate) return;
  throw new DomainError(message, code);
}

export function throwError (message, code) {
  throw new DomainError(message, code);
}

export const HTTP_MAP = {
  INVALID_INPUT: 400,
  UNAUTHENTICATED: 401,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNKNOWN: 500,
};