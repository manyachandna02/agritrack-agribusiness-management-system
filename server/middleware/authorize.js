// server/middleware/authorize.js
//
// Role-based access control (RBAC) middleware. Must run after
// middleware/auth.js, which sets req.user. Usage:
//
//   router.post("/inventory", authenticate, authorize("ADMIN", "MANAGER"), createItem);
//
// Returns 403 if the authenticated user's role is not in the
// allowed list. This is the server-side enforcement of role
// permissions; the frontend may also hide UI for disallowed roles,
// but that is never treated as sufficient on its own.

function authorize(...allowedRoles) {
  return function authorizeRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
}

module.exports = authorize;
