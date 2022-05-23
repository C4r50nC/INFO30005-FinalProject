const express = require('express');
const router = express.Router();
const passport = require('passport');
const utility = require('../auth/pClinicianUtility');

const clinicianController = require('../controllers/clinician');

router.get('/login', utility.unLoggedIn, clinicianController.renderLogin);
router.post(
  '/login',
  utility.unLoggedIn,
  passport.authenticate('clinician-login', {
    successRedirect: '/clinician/home',
    failureRedirect: '/clinician/login',
    failureflash: true,
  }),
);
router.post('/logout', utility.isLoggedIn, clinicianController.logout);
router.get('/home', utility.isLoggedIn, clinicianController.renderHome);
router.get(
  '/dashboard/:screenName',
  utility.isLoggedIn,
  clinicianController.renderPatient,
);
router.post(
  '/change-timeseries',
  utility.isLoggedIn,
  clinicianController.changeTimeSeries,
);
router.post(
  '/support-message',
  utility.isLoggedIn,
  clinicianController.changeSupportMessage,
);
router.get(
  '/note/:screenName',
  utility.isLoggedIn,
  clinicianController.renderNotes,
);
router.get(
  '/history/:screenName',
  utility.isLoggedIn,
  clinicianController.renderHistory,
);
router.post('/note', utility.isLoggedIn, clinicianController.addNote);
router.get(
  '/comment/:screenName',
  utility.isLoggedIn,
  clinicianController.renderComments,
);
router.post(
  '/safety-limits',
  utility.isLoggedIn,
  clinicianController.modifySafetyLimits,
);

router.get(
  '/today-records',
  utility.isLoggedIn,
  clinicianController.getPatientsTodayRecord,
);
router.get(
  '/change-theme',
  utility.isLoggedIn,
  clinicianController.renderChangeTheme,
);
router.post(
  '/change-theme',
  utility.isLoggedIn,
  clinicianController.changeTheme,
);
router.get('/register', utility.isLoggedIn, clinicianController.renderRegister);
router.post('/register', utility.isLoggedIn, clinicianController.register);

module.exports = router;
