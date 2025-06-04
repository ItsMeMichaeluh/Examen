document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("attendanceTrendChart").getContext("2d");

  const labels = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];
  const dataValues = [85, 78, 92, 88, 80]; // Vervang door werkelijke data

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Gem. Aanwezigheid (%)",
        data: dataValues,
        fill: false,
        borderColor: "#3B82F6", // Tailwind-blue-500
        tension: 0.4,
        pointBackgroundColor: "#3B82F6",
        pointRadius: 4,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
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
  };

  new Chart(ctx, config);
});
