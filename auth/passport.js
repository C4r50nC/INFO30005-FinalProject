const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const Patient = require('../models/patient');
const Clinician = require('../models/clinician');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, { _id: user._id, role: user.role });
  });

  passport.deserializeUser((login, done) => {
    if (login.role === 'patient') {
      Patient.findById(login._id, (err, user) => {
        return done(err, { ...user.toObject(), role: 'patient' });
      });
    } else if (login.role === 'clinician') {
      Clinician.findById(login._id, (err, user) => {
        return done(err, { ...user.toObject(), role: 'clinician' });
      });
    } else {
      return done('This user does not have role', null);
    }
  });

  passport.use(
    'patient-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        process.nextTick(() => {
          Patient.findOne({ email }, async (err, patient) => {
            if (err) {
              return done(err);
            } else if (!patient) {
              return done(
                null,
                false,
                req.flash('loginMessage', 'No user found.'),
              );
            } else if (!(await bcrypt.compare(password, patient.password))) {
              return done(
                null,
                false,
                req.flash('loginMessage', 'Failed! Wrong password.'),
              );
            } else {
              return done(
                null,
                { ...patient.toObject(), role: 'patient' },
                req.flash('loginMessage', 'Login successful'),
              );
            }
          });
        });
      },
    ),
  );

  passport.use(
    'clinician-login',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        process.nextTick(() => {
          Clinician.findOne({ email }, async (err, clinician) => {
            if (err) {
              return done(err);
            } else if (!clinician) {
              return done(
                null,
                false,
                req.flash('loginMessage', 'No user found.'),
              );
            } else if (!(await bcrypt.compare(password, clinician.password))) {
              return done(
                null,
                false,
                req.flash('loginMessage', 'Failed! Wrong password.'),
              );
            } else {
              return done(
                null,
                { ...clinician.toObject(), role: 'clinician' },
                req.flash('loginMessage', 'Login successful'),
              );
            }
          });
        });
      },
    ),
  );
};
