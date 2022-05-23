const express = require('express');
const router = express.Router();
const passport = require('passport');
const utility = require('../auth/pPatientUtility');

const patientController = require('../controllers/patient');

router.get('/login', utility.unLoggedIn, patientController.renderLogin);
router.post(
  '/login',
  utility.unLoggedIn,
  passport.authenticate('patient-login', {
    successRedirect: '/patient/home',
    failureRedirect: '/patient/login',
    failureflash: true,
  }),
);
router.post('/logout', utility.isLoggedIn, patientController.logout);
router.post('/record-data', utility.isLoggedIn, patientController.recordData);
router.get('/home', utility.isLoggedIn, patientController.renderHome);
router.get('/history', utility.isLoggedIn, patientController.renderHistory);
router.get('/leaderboard', utility.isLoggedIn, patientController.renderBoard);
router.get(
  '/change-password',
  utility.isLoggedIn,
  patientController.renderChangePassword,
);
router.post('/password', utility.isLoggedIn, patientController.changePassword);
router.get(
  '/change-theme',
  utility.isLoggedIn,
  patientController.renderChangeTheme,
);
router.post('/change-theme', utility.isLoggedIn, patientController.changeTheme);

module.exports = router;
