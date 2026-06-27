import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import AppError, { NotFoundError } from '../Utils/errors/AppError.js';
import AppConfig from '../Config/AppConfig.js';
import logger from '../Config/logger.js';

/**
 * 404 handler — reached when no route matched. Forwards a NotFoundError to the
 * central error handler so the response shape stays consistent.
 */
export const notFoundHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Normalises known third-party / framework errors (Mongoose, body-parser JSON)
 * into our AppError shape. Returns the original error if it is unrecognised.
 */
const normaliseError = (err) => {
  if (err instanceof AppError) return err;

  // Invalid ObjectId / cast failures.
  if (err instanceof mongoose.Error.CastError) {
    return new AppError(`Invalid value for "${err.path}"`, StatusCodes.BAD_REQUEST);
  }

  // Mongoose schema validation.
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
    return new AppError('Validation failed', StatusCodes.UNPROCESSABLE_ENTITY, details);
  }

  // Duplicate key (unique index violation).
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    return new AppError(`Duplicate value for: ${fields}`, StatusCodes.CONFLICT);
  }

  // Malformed JSON body.
  if (err.type === 'entity.parse.failed') {
    return new AppError('Malformed JSON in request body', StatusCodes.BAD_REQUEST);
  }

  return err;
};

/**
 * Central Express error-handling middleware. Must be registered LAST and must
 * keep the 4-argument signature so Express recognises it as an error handler.
 */
export const errorHandler = (err, req, res, _next) => {
  const error = normaliseError(err);
  const isOperational = error instanceof AppError && error.isOperational;
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  // Log unexpected (non-operational) errors at error level with full stack.
  if (!isOperational) {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  } else {
    logger.warn(`${statusCode} on ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  const body = {
    success: false,
    message: isOperational ? error.message : 'Internal server error',
  };

  if (error.details) body.details = error.details;

  // Only expose stack traces outside production to aid debugging.
  if (!AppConfig.IS_PRODUCTION && err.stack) body.stack = err.stack;

  res.status(statusCode).json(body);
};

export default errorHandler;
