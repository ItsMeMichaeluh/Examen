document.addEventListener('DOMContentLoaded', () => {
  const aanwezigheidData = [
    {
      jaar: 2025,
      week: 23,
      aanwezigheid: 180,
      rooster: 200,
    },
    {
      jaar: 2025,
      week: 24,
      aanwezigheid: 150,
      rooster: 200,
    },
    {
      jaar: 2025,
      week: 25,
      aanwezigheid: 120,
      rooster: 180,
    },
        {
      jaar: 2025,
      week: 28,
      aanwezigheid: 120,
      rooster: 180,
    },
  ];

  const labels = aanwezigheidData.map(item => `Week ${item.week}`);
  const percentages = aanwezigheidData.map(item =>
    item.rooster === 0 ? 0 : ((item.aanwezigheid / item.rooster) * 100).toFixed(1)
  );

  const ctx = document.getElementById('aanwezigheidChart').getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Aanwezigheid (%)',
        data: percentages,
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // Tailwind blue-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]

      
      
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
});
