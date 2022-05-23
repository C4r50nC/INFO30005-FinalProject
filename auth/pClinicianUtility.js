// middleware to ensure patient is logged in
function unLoggedIn(req, res, next) {
  next();
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.role === 'clinician') {
      return next();
    } else {
      res.redirect('/patient/home');
      return;
    }
  }
  // if not logged in, redirect to login form
  res.redirect('/clinician/login');
}

module.exports = {
  isLoggedIn,
  unLoggedIn,
};
