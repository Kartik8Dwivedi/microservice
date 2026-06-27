/**
 * Wraps an async route handler so that any rejected promise is forwarded to
 * Express's error-handling middleware via `next(err)`. This removes the need
 * for a try/catch in every controller.
 *
 * Usage: router.get('/', asyncHandler(getAll));
 *
 * @param {Function} fn - async (req, res, next) => {...}
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
