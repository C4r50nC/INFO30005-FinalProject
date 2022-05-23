const Patient = require('../models/patient');
const { addDays, getDateStr } = require('./date');
const { getRecord } = require('./record');

async function calcEngagementRate(patientId) {
  const patient = await Patient.findById(patientId);
  let total = 0,
    recordedCnt = 0;
  for (
    let date = patient.createdAt;
    getDateStr(date) <= getDateStr(new Date());
    date = addDays(date, 1)
  ) {
    const record = await getRecord(patient._id, getDateStr(date));
    const recordObj = record.toObject();
    ++total;
    if (
      Object.values(recordObj.data).some((item) => item.status === 'recorded')
    ) {
      ++recordedCnt;
    }
  }
  return recordedCnt / total;
}

async function getHistoryInfo(patientId) {
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

  return { dates: JSON.stringify(dates), data: JSON.stringify(data) };
}

module.exports = {
  calcEngagementRate,
  getHistoryInfo,
};
