import { StatusCodes } from 'http-status-codes';

/**
 * Standardised success-response envelope so every endpoint returns the same
 * shape. Keep error responses out of here — those are produced centrally by
 * the error handler middleware.
 *
 * Shape: { success: true, message, data, meta? }
 */
export class ApiResponse {
  constructor(data = null, message = 'Success', meta = undefined) {
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta !== undefined) this.meta = meta;
  }
}

/**
 * Convenience helper to send a standardised success response.
 *
 * @param {import('express').Response} res
 * @param {object}  [opts]
 * @param {number}  [opts.statusCode=200]
 * @param {*}       [opts.data=null]
 * @param {string}  [opts.message='Success']
 * @param {object}  [opts.meta]            - Pagination / counts / etc.
 */
export const sendSuccess = (
  res,
  { statusCode = StatusCodes.OK, data = null, message = 'Success', meta } = {}
) => res.status(statusCode).json(new ApiResponse(data, message, meta));

export default ApiResponse;
