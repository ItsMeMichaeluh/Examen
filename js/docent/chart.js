document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("attendanceTrendChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const labels = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];
  const dataValues = [85, 78, 92, 88, 80];

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Gem. Aanwezigheid (%)",
          data: dataValues,
          fill: false,
          borderColor: "#3B82F6",
          tension: 0.4,
          pointBackgroundColor: "#3B82F6",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => value + "%",
          },
        },
      },
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (context) => context.parsed.y + "%",
          },
        },
      },
    },
  });
});
