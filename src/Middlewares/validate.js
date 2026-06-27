import { ValidationError } from '../Utils/errors/AppError.js';

/**
 * Request validation middleware backed by Zod.
 *
 * Pass a schema object describing which parts of the request to validate.
 * Each provided key is parsed and the *parsed* (coerced/stripped) value is
 * written back onto the request, so downstream handlers receive clean data.
 *
 * @param {{ body?: import('zod').ZodTypeAny,
 *           params?: import('zod').ZodTypeAny,
 *           query?: import('zod').ZodTypeAny }} schema
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, _res, next) => {
  const issues = [];

  for (const source of ['body', 'params', 'query']) {
    if (!schema[source]) continue;

    const result = schema[source].safeParse(req[source]);
    if (result.success) {
      // Express 5 makes req.query a getter-only property; assign per-key.
      if (source === 'query') {
        Object.assign(req.query, result.data);
      } else {
        req[source] = result.data;
      }
    } else {
      issues.push(
        ...result.error.issues.map((issue) => ({
          source,
          path: issue.path.join('.'),
          message: issue.message,
        }))
      );
    }
  }

  if (issues.length > 0) {
    return next(new ValidationError('Request validation failed', issues));
  }

  return next();
};

export default validate;
