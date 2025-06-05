// js/docent/chart.js

let attendanceChart = null;

/**
 * Initializes the line chart with an initial data array of length 5 and placeholder labels.
 * Call this once on DOMContentLoaded.
 */
function initAttendanceChart(initialData, initialLabels) {
  const canvas = document.getElementById("attendanceTrendChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const labels = initialLabels || ["Wk –4", "Wk –3", "Wk –2", "Wk –1", "Wk –0"];
  const dataValues = initialData || [0, 0, 0, 0, 0];

  attendanceChart = new Chart(ctx, {
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
}

/**
 * Replace the chart’s data array and labels, then redraw.
 * - newPercentages: array of length 5, e.g. [75, 80, 82, 90, 88]
 * - newLabels: array of length 5, e.g. ["Wk 17", "Wk 18", "Wk 19", "Wk 20", "Wk 21"]
 */
function updateAttendanceChart(newPercentages, newLabels) {
  if (!attendanceChart) return;
  if (newLabels && newLabels.length === 5) {
    attendanceChart.data.labels = newLabels;
  }
  attendanceChart.data.datasets[0].data = newPercentages;
  attendanceChart.update();
}

window.initAttendanceChart = initAttendanceChart;
window.updateAttendanceChart = updateAttendanceChart;

// On initial page load, draw zeros with dummy “Wk –4 … Wk –0” labels
document.addEventListener("DOMContentLoaded", () => {
  initAttendanceChart(
    [0, 0, 0, 0, 0],
    ["Wk –4", "Wk –3", "Wk –2", "Wk –1", "Wk –0"]
  );
});
