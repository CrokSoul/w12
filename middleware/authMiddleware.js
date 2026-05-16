function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).render("errors/403", {
      title: "Access Denied"
    });
  }

  next();
}

function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).render("errors/403", {
        title: "Access Denied"
      });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireRole
};