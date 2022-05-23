const patient = require('../models/patient');
const Patient = require('../models/patient');
const Record = require('../models/record');

async function initRecord(patientId, date) {
  const patient = await Patient.findById(patientId);
  const timeSeries = patient.toObject().timeSeries;
  const data = {};
  for (key in timeSeries) {
    data[key] = {};
    if (timeSeries[key] == false) {
      data[key].status = 'no need';
    } else {
      data[key].status = 'unrecorded';
    }
  }

  const record = new Record({
    patientId,
    recordDate: date,
    data,
  });
  await record.save();
  patient.records.push({ record: record._id });
  await patient.save();
  return record;
}

async function getRecord(patientId, recordDate) {
  const record = await Record.findOne({ patientId, recordDate });
  if (!record) {
    return initRecord(patientId, recordDate);
  }
  return record;
}

function checkExceeded(record, conf) {
  if (record.status !== 'recorded') {
    return false;
  }
  const value = record.value;
  const { min, max } = conf;
  if (min != null && value < min) {
    return true;
  }
  if (max != null && value > max) {
    return true;
  }
  return false;
}

module.exports = {
  initRecord,
  getRecord,
  checkExceeded,
};
