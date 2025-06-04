// Zorg dat deze code pas loopt wanneer de DOM volledig is geladen:
document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("attendanceTrendChart").getContext("2d");

  // Labels voor weekdagen
  const labels = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

  // Voorbeelddata: vervang deze array door je werkelijke attendance‐percentages
  const dataValues = [85, 78, 92, 88, 80];

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
      // Maintain the original canvas aspect ratio (width / height) when resizing.
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.parsed.y + "%";
            },
          },
        },
      },
    },
  };

  new Chart(ctx, config);
});
