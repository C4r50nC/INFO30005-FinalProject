const { getDateStr, addDays } = require('../utils/date');
const { getRecord } = require('../utils/record');
const { calcEngagementRate } = require('../utils/patient');
const Patient = require('../models/patient');
const bcrypt = require('bcrypt');

exports.renderLogin = (req, res) => {
  res.render('pLogin.hbs', {
    loginMessage: req.flash('loginMessage'),
  });
};

exports.renderHome = async (req, res) => {
  const dateStr = getDateStr(new Date());
  const record = await getRecord(req.user._id, dateStr);
  const recordObj = record.toObject();

  const recordsForHbs = Object.keys(recordObj.data)
    .map((key) => ({ key, date: dateStr, ...recordObj.data[key] }))
    .sort((a, b) => {
      const statusV = (status) => {
        return {
          unrecorded: 0,
          recorded: 1,
          'no need': 2,
        }[status];
      };
      return statusV(a.status) - statusV(b.status);
    });

  res.render('pHome.hbs', {
    user: req.user,
    showBadge: (await calcEngagementRate(req.user._id)) > 0.8,
    date: dateStr,
    records: recordsForHbs,
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/patient/login');
};

exports.recordData = async (req, res) => {
  try {
    const patientId = req.user._id;
    const record = await getRecord(patientId, req.body.recordDate);

    const data = record.data[req.body.key];
    data.value = req.body.value;
    data.comment = req.body.comment;
    data.status = 'recorded';
    const date = new Date();
    data.submittedAt = new Date().toLocaleString('en-Au', {
      timeZone: 'Australia/Melbourne',
    });
    data.submittedAtTs = date.valueOf();
    record.save();

    res.redirect('/patient/home?submitted=true');
  } catch (err) {
    console.log(err);
    res.send('error happens when record data');
  }
};

exports.renderHistory = async (req, res) => {
  const patientId = req.user._id;
  const today = Date.now();
  const todayStr = getDateStr(new Date());
  const dates = [];
  const data = { bgl: [], doit: [], exercise: [], weight: [] };

  for (
    let date = addDays(today, -14);
    getDateStr(date) <= todayStr;
    date = addDays(date, 1)
  ) {
    const record = await getRecord(patientId, getDateStr(date));
    const recordObj = record.toObject();
    dates.push(getDateStr(date));
    data.bgl.push(recordObj.data.bloodGlucoseLevel.value);
    data.doit.push(recordObj.data.dosesInsulinTaken.value);
    data.exercise.push(recordObj.data.exercise.value);
    data.weight.push(recordObj.data.weight.value);
  }

  res.render('pHistory.hbs', {
    user: req.user,
    dates: JSON.stringify(dates),
    data: JSON.stringify(data),
  });
};

exports.renderBoard = async (req, res) => {
  const patients = await Patient.find().lean();
  const list = [];

  for (const patient of patients) {
    const rate = await calcEngagementRate(patient._id);
    list.push({
      screenName: patient.screenName,
      engagementRate: rate,
      engagementRateText: (rate * 100).toFixed(2) + '%',
    });
  }

  const patientsForHbs = list
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 5)
    .map((it, idx) => ({
      ...it,
      rank: idx + 1,
    }));

  res.render('pBoard.hbs', {
    user: req.user,
    patients: patientsForHbs,
  });
};

exports.renderChangePassword = async (req, res) => {
  res.render('pChangePassword.hbs', {
    user: req.user,
    message: req.flash('message'),
  });
};

exports.changePassword = async (req, res) => {
  if (req.body.newPassword !== req.body.confirmPassword) {
    req.flash(
      'message',
      'The new password is different with the confirm password',
    ),
      res.redirect('/patient/change-password');
    return;
  }
  const patient = await Patient.findById(req.user._id);
  patient.password = await bcrypt.hash(req.body.newPassword, 10);
  await patient.save();
  res.redirect('/patient/home');
};

exports.renderChangeTheme = async (req, res) => {
  const user = req.user;

  res.render('pChangeTheme.hbs', {
    user: req.user,
    theme: user.theme,
    message: req.flash('message'),
  });
};

exports.changeTheme = async (req, res) => {
  const patient = await Patient.findById(req.user._id);
  patient.theme = req.body.theme;
  await patient.save();

  req.flash('message', 'modify success!');
  res.redirect('/patient/change-theme');
};
