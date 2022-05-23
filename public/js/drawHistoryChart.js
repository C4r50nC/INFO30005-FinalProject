function drawBgl(dates, data) {
  const bgl = document.getElementById('canvas-bgl').getContext('2d');
  new Chart(bgl, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Blood Glucose Level',
          data: data,
          backgroundColor: 'transparent',
          borderColor: '#faad14',
          borderWidth: 1,
        },
      ],
    },
    options: {
      elements: {
        line: {
          tension: 0.5,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function drawDoit(dates, data) {
  const doit = document.getElementById('canvas-doit').getContext('2d');
  new Chart(doit, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Doses of Insulin Taken',
          data: data,
          backgroundColor: 'transparent',
          borderColor: '#1890ff',
          borderWidth: 1,
        },
      ],
    },
    options: {
      elements: {
        line: {
          tension: 0.5,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
function drawExercise(dates, data) {
  const exercise = document.getElementById('canvas-exercise').getContext('2d');
  new Chart(exercise, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Exercise',
          data: data,
          backgroundColor: 'transparent',
          borderColor: '#52c41a',
          borderWidth: 1,
        },
      ],
    },
    options: {
      elements: {
        line: {
          tension: 0.5,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
function drawWeight(dates, data) {
  const weight = document.getElementById('canvas-weight').getContext('2d');
  new Chart(weight, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Weight',
          data: data,
          backgroundColor: 'transparent',
          borderColor: '#fa8c16',
          borderWidth: 1,
        },
      ],
    },
    options: {
      elements: {
        line: {
          tension: 0.5,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function draw(dates, data) {
  drawBgl(dates, data.bgl);
  drawDoit(dates, data.doit);
  drawExercise(dates, data.exercise);
  drawWeight(dates, data.weight);
}
