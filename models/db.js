const mongoose = require('mongoose');
const Patient = require('./patient');
const Clinician = require('./clinician');
const Record = require('./record');
const bcrypt = require('bcrypt');
const { addDays, getDateStr } = require('../utils/date');
const { getRecord } = require('../utils/record');

async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost', {
      dbName: 'Diabetes@Home',
    });

    console.log('connected to MongoDB');

    if (parseInt(process.env.DROP_DB)) {
      await mongoose.connection.db.dropDatabase();
    }
  } catch (err) {
    console.log(err, '\nfailed to connect to MongoDB');
    throw err;
  }
}

async function initOnePatient(id, clinician) {
  const newPatient = new Patient({
    email: `patient${id}@gmail.com`,
    password: await bcrypt.hash(`patient${id}`, 10),
    firstName: `Fname${id}`,
    lastName: `Lname${id}`,
    screenName: id === 1 ? 'Pat' : `Patient${id}`,
    records: [],
    clinician: clinician._id,
    timeSeries: {
      bloodGlucoseLevel: id === 1 || Math.random() >= 0.5,
      weight: id === 1 || Math.random() >= 0.5,
      dosesInsulinTaken: id === 1 || Math.random() >= 0.5,
      exercise: id === 1 || Math.random() >= 0.5,
    },
    supportMessage: `Patient${id}, You are great!!!`,
    createdAt: id === 1 ? addDays(new Date(), -10) : new Date(),
  });
  newPatient.save();
  return newPatient;
}

async function initPatients() {
  const patient = await Patient.findOne();
  if (patient) {
    return;
  }

  for (let i = 0; i < 15; ++i) {
    const clinician = await Clinician.findOne();
    const newPatient = await initOnePatient(i + 1, clinician);
    clinician.patients.push({ patient: newPatient._id });
    await clinician.save();
  }
}

async function initClinicians() {
  const clinician = await Clinician.findOne();
  if (clinician) {
    return;
  }

  for (let i = 0; i < 3; ++i) {
    const id = i + 1;
    const newClinician = new Clinician({
      email: `clinician${id}@gmail.com`,
      password: await bcrypt.hash(`clinician${id}`, 10),
      firstName: `FnameCli${id}`,
      lastName: `LnameCli${id}`,
      screenName: id === 1 ? 'Chris' : `Clinician${id}`,
      patients: [],
    });
    await newClinician.save();
  }
}

async function initRecords() {
  const record = await Record.findOne();
  if (record) {
    return;
  }

  const patient = await Patient.findOne({ screenName: 'Pat' });
  for (
    let date = addDays(patient.createdAt, 1);
    getDateStr(date) <= getDateStr(new Date());
    date = addDays(date, 1)
  ) {
    const record = await getRecord(patient._id, getDateStr(date));
    const recordObj = record.toObject();
    Object.keys(recordObj.data).forEach((key) => {
      record.data[key].value = Math.floor(Math.random() * 100 + 1);
      record.data[key].status = 'recorded';
      const date = new Date();
      record.data[key].submittedAt = date.toLocaleString('en-Au', {
        timeZone: 'Australia/Melbourne',
      });
      record.data[key].submittedAtTs = date.valueOf();
      record.data[key].comment = `comment on '${record.data[key].fullName}'`;
    });
    await record.save();
  }
}

async function initDbData() {
  await initClinicians();
  await initPatients();
  await initRecords();
}

async function initDb() {
  await connectDb();
  await initDbData();
}

module.exports = {
  initDb,
};
