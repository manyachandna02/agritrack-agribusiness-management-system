// server/utils/asyncHandler.js
//
// Wraps an async Express handler so any rejected promise / thrown error
// is forwarded to next(err) instead of crashing the process or requiring
// a try/catch in every controller. Used by the Phase 3/4 controllers;
// Phase 2's authController keeps its own try/catch (written before this
// existed) and both are equivalent from the error handler's point of view.

function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
