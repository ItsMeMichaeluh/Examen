let attendanceChart = null;

/**
 * Initializes the line chart with initial data and labels.
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
          max: 120,
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
 * Updates the chart with new data.
 */
function updateAttendanceChart(newPercentages, newLabels) {
  if (!attendanceChart) return;
  if (newLabels && newLabels.length === 5) {
    attendanceChart.data.labels = newLabels;
  }
  attendanceChart.data.datasets[0].data = newPercentages;
  attendanceChart.update();
}

/**
 * Handles changes in the week/year filters.
 */
function handleFilterChange() {
  // 1. Read selected week and year
  const weekVal = document.getElementById("week-select").value; // e.g. "2025-21"
  let selYear = null,
    selWeek = null;
  if (weekVal) {
    const [y, w] = weekVal.split("-").map((x) => parseInt(x, 10));
    selYear = y;
    selWeek = w;
  }

  const yearVal = document.getElementById("jaar-select").value; // e.g. "2025"
  const selYearOnly = yearVal ? parseInt(yearVal, 10) : null;

  // 2. Filter your students
  const filteredStudents = allStudents.filter((student) => {
    if (!student.attendances) return false;

    // Check if student has attendance matching the selected year/week
    if (selYear && selWeek) {
      return student.attendances.some(
        (a) => a.year === selYear && a.week === selWeek
      );
    }
    if (selYearOnly) {
      return student.attendances.some((a) => a.year === selYearOnly);
    }
    return true; // No filter selected — include all students
  });

  // 3. Determine weeks to display (latest 5 weeks or selected week +/- 4)
  let weekNumbers = [];
  let weekLabels = [];
  if (selWeek && selYear) {
    for (let i = 4; i >= 0; i--) {
      let week = selWeek - i;
      weekLabels.push(`Wk ${week}`);
      weekNumbers.push(week);
    }
  } else {
    // fallback: last 5 weeks
    weekLabels = ["Wk –4", "Wk –3", "Wk –2", "Wk –1", "Wk –0"];
    weekNumbers = [1, 2, 3, 4, 5]; // placeholder
  }

  // 4. Calculate averages
  const averages = calculateWeeklyAverages(filteredStudents, weekNumbers);

  // 5. Update the chart
  updateAttendanceChart(averages, weekLabels);

  // 6. Update student table
  renderStudentTable(filteredStudents);
}

/**
 * Calculates weekly averages.
 */
function calculateWeeklyAverages(students, weekNumbers) {
  return weekNumbers.map((week) => {
    let totalPct = 0;
    let count = 0;
    students.forEach((student) => {
      const att = student.attendances.find((a) => a.week === week);
      if (att) {
        const scheduled = att.scheduled || 0;
        const logged = att.logged || 0;
        const pct = scheduled > 0 ? Math.round((logged / scheduled) * 100) : 0;
        totalPct += pct;
        count++;
      }
    });
    return count > 0 ? Math.round(totalPct / count) : 0;
  });
}

// Initialize the chart on page load
document.addEventListener("DOMContentLoaded", () => {
  initAttendanceChart(
    [0, 0, 0, 0, 0],
    ["Wk –4", "Wk –3", "Wk –2", "Wk –1", "Wk –0"]
  );

  // Bind filter change listeners
  const weekSelect = document.getElementById("week-select");
  const yearSelect = document.getElementById("jaar-select");
  if (weekSelect) weekSelect.addEventListener("change", handleFilterChange);
  if (yearSelect) yearSelect.addEventListener("change", handleFilterChange);
});
