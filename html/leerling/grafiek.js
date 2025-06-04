document.addEventListener('DOMContentLoaded', () => {
  const aanwezigheidData = [
  {
    jaar: 2025,
    week: 26,
    aanwezigheid: 160,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 27,
    aanwezigheid: 140,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 28,
    aanwezigheid: 180,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 29,
    aanwezigheid: 90,
    rooster: 170,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 30,
    aanwezigheid: 0,
    rooster: 150,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 31,
    aanwezigheid: 200,
    rooster: 200,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 32,
    aanwezigheid: 120,
    rooster: 150,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 33,
    aanwezigheid: 130,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 34,
    aanwezigheid: 155,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 35,
    aanwezigheid: 80,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 36,
    aanwezigheid: 0,
    rooster: 140,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 37,
    aanwezigheid: 145,
    rooster: 170,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 38,
    aanwezigheid: 170,
    rooster: 170,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 39,
    aanwezigheid: 190,
    rooster: 200,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 40,
    aanwezigheid: 110,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 41,
    aanwezigheid: 105,
    rooster: 150,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 42,
    aanwezigheid: 0,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 43,
    aanwezigheid: 165,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 44,
    aanwezigheid: 100,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 45,
    aanwezigheid: 200,
    rooster: 180,
    studentnummer: 1234567890
  }
];

  aanwezigheidData.sort((a, b) => {
    if (a.jaar !== b.jaar) {
      return a.jaar - b.jaar;
    }
    return a.week - b.week;
  });

  const labels = aanwezigheidData.map(item => `Week ${item.week}`);
  const percentages = aanwezigheidData.map(item =>
    item.rooster === 0 ? 0 : ((item.aanwezigheid / item.rooster) * 100).toFixed(1)
  );
  const roosterPercentages = aanwezigheidData.map(() => 100); // 100% balk voor rooster

  const ctx = document.getElementById('aanwezigheidChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Aanwezigheid (%)',
          data: percentages,
          backgroundColor: 'rgba(59, 130, 246, 0.6)', // Tailwind blue
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Rooster (%)',
          data: roosterPercentages,
          backgroundColor: 'rgba(239, 68, 68, 0.6)', // Tailwind red
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 120,
          title: {
            display: true,
            text: 'Percentage'
          },
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}%`;
            }
          }
        }
      }
    }
  });
});
