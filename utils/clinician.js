const Patient = require('../models/patient');
const { getDateStr } = require('./date');
const { checkExceeded, getRecord } = require('./record');

async function getPatientsTodayRecord(req) {
  const patients = await Patient.find({ clinician: req.user._id }).lean();
  const dateStr = getDateStr(new Date());
  const getText = (record, key) => {
    const curData = record.data[key];
    if (curData.status === 'no need') {
      return 'no need';
    }
    if (curData.status === 'recorded') {
      return curData.value;
    }
    return 'missing';
  };

  for (const it of patients) {
    it.todayRecord = await getRecord(it._id, dateStr);
    it.exceedResult = {};
    Object.keys(it.todayRecord.data).forEach((key) => {
      it[key] = getText(it.todayRecord, key);
      it.exceedResult[key] = checkExceeded(
        it.todayRecord.data[key],
        it.safetyLimits[key],
      );
    });
  }

  return {
    patients,
    date: dateStr,
  };
}

module.exports = {
  getPatientsTodayRecord,
};
