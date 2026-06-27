import { StatusCodes } from 'http-status-codes';

/**
 * Base class for all known/operational errors in the application.
 *
 * "Operational" errors are expected failures we handle gracefully (bad input,
 * missing resource, auth failure). They carry an HTTP status code and a safe,
 * client-facing message. Anything that is NOT an AppError is treated as an
 * unexpected programmer error by the central error handler and is not leaked
 * to the client.
 */
class AppError extends Error {
  /**
   * @param {string} message    - Client-safe error message.
   * @param {number} statusCode - HTTP status code to respond with.
   * @param {object} [details]  - Optional structured details (e.g. validation issues).
   */
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details) {
    super(message, StatusCodes.BAD_REQUEST, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', details) {
    super(message, StatusCodes.CONFLICT, details);
  }
}

export default AppError;
