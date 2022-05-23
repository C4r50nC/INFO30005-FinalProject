const { getDateStr, addDays } = require('../utils/date');
const { getRecord, checkExceeded } = require('../utils/record');
const { getHistoryInfo } = require('../utils/patient');
const { getPatientsTodayRecord } = require('../utils/clinician');
const Patient = require('../models/patient');
const Record = require('../models/record');
const bcrypt = require('bcrypt');
const Clinician = require('../models/clinician');

exports.renderLogin = (req, res) => {
  res.render('cLogin.hbs', {
    loginMessage: req.flash('loginMessage'),
  });
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/clinician/login');
};

exports.renderHome = async (req, res) => {
  res.render('cHome.hbs', {
    user: req.user,
    ...(await getPatientsTodayRecord(req)),
  });
};

exports.renderPatient = async (req, res) => {
  try {
    const screenName = req.params.screenName;
    const patient = await Patient.findOne({ screenName }).lean();
    const history = await getHistoryInfo(patient._id);

    res.render('cPatient.hbs', {
      user: req.user,
      patient,
      history,
    });
  } catch (err) {
    res.send('error happens when render patient detail');
    throw err;
  }
};

exports.changeTimeSeries = async (req, res) => {
  const { patientId, ...timeSeries } = req.body;
  const patient = await Patient.findById(patientId);
  Object.keys(patient.timeSeries).forEach((key) => {
    patient.timeSeries[key] = timeSeries[key] === 'on';
  });
  await patient.save();
  res.redirect('/clinician/dashboard/' + patient.screenName);
};

exports.changeSupportMessage = async (req, res) => {
  const { patientId, supportMessage } = req.body;
  const patient = await Patient.findById(patientId);
  patient.supportMessage = supportMessage;
  await patient.save();
  res.redirect('/clinician/dashboard/' + patient.screenName);
};

exports.renderNotes = async (req, res) => {
  const screenName = req.params.screenName;
  const patient = await Patient.findOne({ screenName }).lean();

  res.render('cNotes.hbs', {
    user: req.user,
    patient,
  });
};

exports.addNote = async (req, res) => {
  const { patientId, note } = req.body;
  const patient = await Patient.findById(patientId);
  patient.notes.push({
    text: note,
    createdAt: new Date().toLocaleString('en-Au', {
      timeZone: 'Australia/Melbourne',
    }),
  });
  await patient.save();
  res.redirect('/clinician/note/' + patient.screenName);
};

exports.renderComments = async (req, res) => {
  const screenName = req.params.screenName;
  const patient = await Patient.findOne({ screenName }).lean();
  const records = await Record.find({ patientId: patient._id }).lean();

  const comments = records
    .map((it) =>
      Object.keys(it.data).map((it2) => {
        return {
          text: it.data[it2].comment,
          submittedAt: it.data[it2].submittedAt,
        };
      }),
    )
    .flat(Infinity)
    .filter((it) => it.text);

  res.render('cComments.hbs', {
    user: req.user,
    patient,
    comments,
  });
};

exports.modifySafetyLimits = async (req, res) => {
  const { patientId, ...body } = req.body;
  const patient = await Patient.findById(patientId);

  Object.keys(body).forEach((key) => {
    const [it, it2] = key.split('.');
    patient.safetyLimits[it][it2] = !body[key] ? null : parseInt(body[key]);
  });

  await patient.save();
  res.redirect('/clinician/dashboard/' + patient.screenName);
};

exports.renderHistory = async (req, res) => {
  const screenName = req.params.screenName;
  const patient = await Patient.findOne({ screenName }).lean();
  const patientId = patient._id;
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

  res.render('cHistory.hbs', {
    user: req.user,
    patient,
    dates: JSON.stringify(dates),
    data: JSON.stringify(data),
  });
};

exports.getPatientsTodayRecord = async (req, res) => {
  res.json(await getPatientsTodayRecord(req));
};

exports.renderChangeTheme = async (req, res) => {
  const user = req.user;

  res.render('cChangeTheme.hbs', {
    user: req.user,
    theme: user.theme,
    message: req.flash('message'),
  });
};

exports.changeTheme = async (req, res) => {
  const clinician = await Clinician.findById(req.user._id);
  clinician.theme = req.body.theme;
  await clinician.save();

  req.flash('message', 'modify success!');
  res.redirect('/clinician/change-theme');
};

exports.renderRegister = async (req, res) => {
  res.render('cRegisterPatient.hbs', {
    user: req.user,
    errorMessage: req.flash('errorMessage'),
    successMessage: req.flash('successMessage'),
  });
};

exports.register = async (req, res) => {
  try {
    const id = req.user._id;
    const body = req.body;
    if (body.password !== body.confirmPassword) {
      throw Error('Password is not same with confirm password');
    }

    if (await Patient.findOne({ email: body.email })) {
      throw Error(`Patient's email can't be ${body.email}, it existed`);
    }

    if (await Patient.findOne({ screenName: body.screenName })) {
      throw Error(
        `Patient's screenName can't be ${body.screenName}, it existed`,
      );
    }

    body.timeSeries = {};
    Object.keys(body).forEach((key) => {
      if (key.includes('timeSeries.')) {
        const [, key2] = key.split('.');
        body.timeSeries[key2] = body[key] === 'on';
        delete body[key];
      }
    });
    delete body.confirmPassword;
    body.password = await bcrypt.hash(body.password, 10);
    const patient = new Patient({
      clinician: id,
      createdAt: new Date(),
      ...body,
    });
    await patient.save();
    req.flash('successMessage', 'create successfully');
    res.redirect('/clinician/register');
  } catch (err) {
    req.flash('errorMessage', err.message);
    res.redirect('/clinician/register');
  }
};
