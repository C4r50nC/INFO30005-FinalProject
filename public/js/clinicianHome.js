const notifyBoxEle = document.querySelector('.notify-box');
const dateEle = document.querySelector('.date');
const tableEle = document.querySelector('.table tbody');

let firstQuery = true;
let lastMaxRecordTime = new Date().valueOf();

function findAllUpdatedRecords({ patients }) {
  const res = [];
  let newLastMaxRecordTime = lastMaxRecordTime;

  patients.forEach((it) => {
    const record = it.todayRecord;
    Object.keys(record.data).forEach((key) => {
      if (record.data[key].submittedAtTs) {
        const time = record.data[key].submittedAtTs;
        if (time > lastMaxRecordTime) {
          if (time > newLastMaxRecordTime) {
            newLastMaxRecordTime = time;
          }

          if (!firstQuery) {
            res.push({
              recordKey: key,
              recordItem: record.data[key],
              patient: it,
            });
          }
        }
      }
    });
  });

  firstQuery = false;
  lastMaxRecordTime = newLastMaxRecordTime;
  return res.sort((a, b) => {
    const ta = a.recordItem.submittedAtTs;
    const tb = b.recordItem.submittedAtTs;
    return ta - tb;
  });
}

function updateTable(patients) {
  const rows = tableEle.querySelectorAll('tr:not(:first-child)');
  for (const row of rows) {
    row.remove();
  }

  const makeTd = (exceed, value) => `
<td ${
    exceed ? "style='background-color: #ff4d4f;color: white;'" : ''
  }>${value}</td>
`;

  patients.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
<td><a href='/clinician/dashboard/${p.screenName}'>${p.screenName}</a></td>
${makeTd(p.exceedResult.bloodGlucoseLevel, p.bloodGlucoseLevel)}
${makeTd(p.exceedResult.weight, p.weight)}
${makeTd(p.exceedResult.dosesInsulinTaken, p.dosesInsulinTaken)}
${makeTd(p.exceedResult.exercise, p.exercise)}
`;
    tableEle.append(tr);
  });
}

function updateUi({ date, patients, updatedRecords }) {
  dateEle.innerHTML = date;
  if (!updatedRecords.length) {
    return;
  }
  updateTable(patients);
  for (const d of updatedRecords) {
    const newEle = document.createElement('li');
    newEle.innerHTML = `${d.patient.screenName} enters data of ${d.recordItem.fullName} outside safety range at ${d.recordItem.submittedAt}`;
    notifyBoxEle.insertBefore(newEle, notifyBoxEle.firstChild);
  }
}

async function intervalQuery() {
  try {
    const res = await fetch('/clinician/today-records');
    const data = await res.json();
    const updatedRecords = findAllUpdatedRecords(data);
    updateUi({ ...data, updatedRecords });
  } catch (err) {
    console.error(err);
  }
}

intervalQuery();
setInterval(intervalQuery, 1000);
