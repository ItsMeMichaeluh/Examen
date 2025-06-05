// js/docent/student_fetch.js

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
  // 1) Fetch ALL students from the API:
  axios
    .get("http://145.14.158.244:8000/api/students")
    .then((resp) => {
      allStudents = resp.data.member || [];

      // === Extract unique years & (year-week) pairs ===
      const { uniqueYears, uniqueYearWeeks } =
        extractYearsAndWeeks(allStudents);

      // === Populate <select id="jaar-select"> ===
      const yearSelect = document.getElementById("jaar-select");
      if (yearSelect) {
        yearSelect.innerHTML = `<option value="">Alle Jaren</option>`;
        uniqueYears.forEach((yr) => {
          yearSelect.innerHTML += `<option value="${yr}">${yr}</option>`;
        });
      }

      // === Populate <select id="week-select"> ===
      const weekSelect = document.getElementById("week-select");
      if (weekSelect) {
        weekSelect.innerHTML = `<option value="">Alle Weken</option>`;
        uniqueYearWeeks.forEach((str) => {
          const [y, w] = str.split("-").map((x) => parseInt(x, 10));
          weekSelect.innerHTML += `
            <option value="${str}">${y} – Week ${w}</option>
          `;
        });
      }

      // === Now render the full table & wire up the rest ===
      renderStudentTable(allStudents);
      attachDetailButtonListeners();
      setupFiltersAndListeners();
    })
    .catch((err) => {
      console.error("Error fetching /api/students:", err);
      const tbody = document.getElementById("studentTableBody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="px-3 py-2 text-sm text-red-600 text-center">
              Failed to load students.
            </td>
          </tr>
        `;
      }
    });

  // 2) Wire up the “close” button on the details modal:
  const closeBtn = document.getElementById("closeStudentDetails");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document
        .getElementById("studentDetailsContainer")
        .classList.add("hidden");
    });
  }
});

/**
 * When any filter/search input changes, this function re-applies all four filters.
 */
function applyFilters() {
  const query = document
    .getElementById("studentSearch")
    .value.trim()
    .toLowerCase();
  const weekValue = document.getElementById("week-select").value; // "2024-42" or ""
  const yearValue = document.getElementById("jaar-select").value; // "2024" or ""
  const catValue = document.getElementById("category-filter").value; // "Goed", etc.

  // Build a filtered array:
  const filtered = allStudents.filter((stu) => {
    // 1) Search by studentNumber substring:
    if (query && !stu.studentNumber.toLowerCase().includes(query)) {
      return false;
    }

    // 2) Find that student’s “latest attendance”:
    let latestAtt = null;
    (stu.attendances || []).forEach((a) => {
      if (!latestAtt) {
        latestAtt = a;
      } else {
        if (a.year > latestAtt.year) {
          latestAtt = a;
        } else if (a.year === latestAtt.year && a.week > latestAtt.week) {
          latestAtt = a;
        }
      }
    });

    // If no attendance exists:
    if (!latestAtt) {
      // If any of the attendance-dependent filters is non-empty, exclude:
      if (weekValue || yearValue || catValue) return false;
      return true;
    }

    // 3) Week filter (if set)
    if (weekValue) {
      const [selYear, selWeek] = weekValue.split("-").map(Number);
      if (latestAtt.year !== selYear || latestAtt.week !== selWeek) {
        return false;
      }
    }

    // 4) Year filter (if set)
    if (yearValue) {
      if (latestAtt.year !== Number(yearValue)) {
        return false;
      }
    }

    // 5) Category filter (if set)
    if (catValue) {
      const pct =
        latestAtt.scheduled > 0
          ? Math.round((latestAtt.logged / latestAtt.scheduled) * 100)
          : 0;
      const catLabel = getCategoryLabel(pct);
      if (catLabel !== catValue) {
        return false;
      }
    }

    // Passed all filters
    return true;
  });

  // Re-render the filtered list
  renderStudentTable(filtered);
  attachDetailButtonListeners();
}

/**
 * If you want all four controls to fire `applyFilters()`, set them up here.
 */
function setupFiltersAndListeners() {
  const searchInput = document.getElementById("studentSearch");
  const weekSelect = document.getElementById("week-select");
  const yearSelect = document.getElementById("jaar-select");
  const categorySel = document.getElementById("category-filter");

  [searchInput, weekSelect, yearSelect, categorySel].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });
}

/**
 * Given students[], return two sorted lists:
 *   - uniqueYears:    [2024, 2025, …]
 *   - uniqueYearWeeks: ["2024-42","2024-43",…,"2025-21"]
 */
function extractYearsAndWeeks(students) {
  const yearSet = new Set();
  const yearWeekSet = new Set();

  students.forEach((stu) => {
    (stu.attendances || []).forEach((att) => {
      const y = parseInt(att.year, 10);
      const w = parseInt(att.week, 10);
      if (!isNaN(y)) {
        yearSet.add(y);
        if (!isNaN(w)) {
          yearWeekSet.add(`${y}-${w}`);
        }
      }
    });
  });

  const uniqueYears = Array.from(yearSet).sort((a, b) => a - b);
  const uniqueYearWeeks = Array.from(yearWeekSet)
    .map((str) => {
      const [y, w] = str.split("-").map((x) => parseInt(x, 10));
      return { year: y, week: w, key: str };
    })
    .sort((a, b) => a.year - b.year || a.week - b.week)
    .map((obj) => obj.key);

  return { uniqueYears, uniqueYearWeeks };
}

/**
 * Return one of your category labels for a given percentage 0–100.
 */
function getCategoryLabel(pct) {
  if (pct >= 100) return "Perfect";
  if (pct >= 95) return "Excellent";
  if (pct >= 80) return "Goed";
  if (pct >= 65) return "Voldoende";
  if (pct >= 50) return "Onvoldoende";
  if (pct > 0) return "Kritiek";
  return "Geen Aanwezigheid";
}

/**
 * Generate a fake “First Last” name from a studentNumber, so each student
 * looks plausible even though you don’t have real names in your data.
 */
function generateFakeName(studentNumber) {
  const firstNames = [
    "Emma",
    "Daan",
    "Sophie",
    "Lucas",
    "Julia",
    "Liam",
    "Tess",
    "Noah",
    "Eva",
    "Mila",
    "Finn",
    "Sara",
    "Sem",
    "Lotte",
    "Sam",
  ];
  const lastNames = [
    "Jansen",
    "De Vries",
    "Van den Berg",
    "Bakker",
    "Visser",
    "Smit",
    "Meijer",
    "De Jong",
    "Mulder",
    "Bos",
    "Vos",
    "Peters",
    "Hendriks",
    "Dekker",
    "Koopman",
  ];

  let hash = 0;
  for (let i = 0; i < studentNumber.length; i++) {
    hash = (hash << 5) - hash + studentNumber.charCodeAt(i);
    hash |= 0; // keep 32-bit
  }
  hash = Math.abs(hash);

  const firstIndex = hash % firstNames.length;
  const lastIndex = Math.floor(hash / firstNames.length) % lastNames.length;
  return `${firstNames[firstIndex]} ${lastNames[lastIndex]}`;
}

/**
 * Render an array of Student objects into the <tbody id="studentTableBody">.
 */
function renderStudentTable(students) {
  const tbody = document.getElementById("studentTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="px-3 py-2 text-sm text-gray-500 text-center">
          No students found.
        </td>
      </tr>`;
    return;
  }

  students.forEach((stu) => {
    const studentNumber = stu.studentNumber || "—";
    const name = generateFakeName(studentNumber);

    // Find the “latest” attendance:
    let latestAtt = null;
    (stu.attendances || []).forEach((a) => {
      if (!latestAtt) {
        latestAtt = a;
      } else if (a.year > latestAtt.year) {
        latestAtt = a;
      } else if (a.year === latestAtt.year && a.week > latestAtt.week) {
        latestAtt = a;
      }
    });

    // Default placeholders:
    let pctText = "—",
      logged = "—",
      scheduled = "—",
      category = "—";

    if (latestAtt) {
      logged = latestAtt.logged;
      scheduled = latestAtt.scheduled;
      const pct =
        latestAtt.scheduled > 0
          ? Math.round((latestAtt.logged / latestAtt.scheduled) * 100)
          : 0;
      pctText = pct + "%";

      // Determine category from pct:
      if (pct >= 100) category = "Perfect";
      else if (pct >= 95) category = "Excellent";
      else if (pct >= 80) category = "Goed";
      else if (pct >= 65) category = "Voldoende";
      else if (pct >= 50) category = "Onvoldoende";
      else if (pct > 0) category = "Kritiek";
      else category = "Geen Aanwezigheid";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${studentNumber}</td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${name}</td>
      <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">${pctText}</td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${logged}</td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${scheduled}</td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${category}</td>
      <td class="px-3 py-2 whitespace-nowrap text-right text-sm">
        <button
          class="details-btn text-indigo-600 hover:text-indigo-900 font-medium"
          data-student-number="${studentNumber}"
        >Details</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Attach click listeners to every “Details” button so the modal opens + populates.
 */
function attachDetailButtonListeners() {
  const buttons = document.querySelectorAll(".details-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const studentNumber = btn.getAttribute("data-student-number");
      if (!studentNumber) return;

      // Find the matching student object:
      const stu = allStudents.find((s) => s.studentNumber === studentNumber);
      if (!stu) return;

      // 1) Show the modal:
      document
        .getElementById("studentDetailsContainer")
        .classList.remove("hidden");

      // 2) Fill in studentNumber + active:
      document.getElementById("detailStudentNumber").textContent =
        stu.studentNumber;
      document.getElementById("detailActive").textContent = stu.active
        ? "Yes"
        : "No";

      // 3) Fill in full attendance history:
      const tbody = document.getElementById("detailAttendanceBody");
      tbody.innerHTML = "";
      const sorted = (stu.attendances || []).slice().sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.week - b.week;
      });

      if (sorted.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="px-3 py-2 text-sm text-gray-500 text-center">
              Geen aanwezigheidsdata.
            </td>
          </tr>`;
      } else {
        sorted.forEach((att) => {
          const pct =
            att.scheduled > 0
              ? Math.round((att.logged / att.scheduled) * 100)
              : 0;
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${att.year}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${att.week}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${att.scheduled}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${att.logged}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">${pct}%</td>
          `;
          tbody.appendChild(tr);
        });
      }
    });
  });
}
