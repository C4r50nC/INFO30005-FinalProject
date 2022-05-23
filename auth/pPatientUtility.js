// middleware to ensure patient is logged in
function unLoggedIn(req, res, next) {
  next();
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.role === 'patient') {
      return next();
    } else {
      res.redirect('/clinician/home');
      return;
    }
  }
  req.logout();
  res.redirect('/patient/login');
}

module.exports = {
  isLoggedIn,
  unLoggedIn,
};
