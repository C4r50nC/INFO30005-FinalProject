function addDays(oriDate, days) {
  const date = new Date(oriDate.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function getDateStr(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

module.exports = {
  addDays,
  getDateStr,
};
