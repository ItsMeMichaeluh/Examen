// js/docent/student_fetch.js

// --------------------------
// Helper Functions
// --------------------------

/**
 * Extracts unique years and year-week pairs from all students' attendance data.
 * Returns { uniqueYears: [2024, 2025, …], uniqueYearWeeks: ["2024-42", …] }.
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
 * Generates a fake “First Last” name from a studentNumber string.
 * Used so that each student row shows a plausible name.
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
    hash |= 0;
  }
  hash = Math.abs(hash);

  const firstIndex = hash % firstNames.length;
  const lastIndex = Math.floor(hash / firstNames.length) % lastNames.length;
  return `${firstNames[firstIndex]} ${lastNames[lastIndex]}`;
}

/**
 * Given a percentage number 0–100, returns the category label.
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

// --------------------------
// Rendering Functions
// --------------------------

/**
 * Renders an array of student objects into <tbody id="studentTableBody">.
 * Includes colored badge in the “Categorie” column and an activate/deactivate button.
 */
function renderStudentTable(students) {
  const tbody = document.getElementById("studentTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="px-3 py-2 text-sm text-gray-500 text-center">
          No students found.
        </td>
      </tr>`;
    return;
  }

  students.forEach((stu) => {
    const studentNumber = stu.studentNumber || "—";
    const name = generateFakeName(studentNumber);

    // Find latest attendance record
    let latestAtt = null;
    (stu.attendances || []).forEach((a) => {
      if (
        !latestAtt ||
        a.year > latestAtt.year ||
        (a.year === latestAtt.year && a.week > latestAtt.week)
      ) {
        latestAtt = a;
      }
    });

    // Calculate attendance %
    let pctText = "—",
      logged = "—",
      scheduled = "—",
      category = "Geen Aanwezigheid";
    if (latestAtt) {
      logged = latestAtt.logged;
      scheduled = latestAtt.scheduled;
      const pct = scheduled > 0 ? Math.round((logged / scheduled) * 100) : 0;
      pctText = pct + "%";
      category = getCategoryLabel(pct);
    }
    const cssClass = "mark-" + category.toLowerCase().replace(/\s+/g, "-");

    // Active toggle button
    const isActive = stu.active;
    const toggleLabel = isActive ? "Deactiveer" : "Activeer";
    const toggleClass = isActive
      ? "bg-red-500 hover:bg-red-600"
      : "bg-green-500 hover:bg-green-600";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <!-- Student # -->
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 flex items-center space-x-2">
        <input type="checkbox" class="student-checkbox" data-student-number="${studentNumber}" />
        <span>${studentNumber}</span>
      </td>

      <!-- Fake Name -->
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${name}
      </td>

      <!-- % -->
      <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
        ${pctText}
      </td>

      <!-- Logged -->
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${logged}
      </td>

      <!-- Scheduled -->
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${scheduled}
      </td>

      <!-- Category -->
      <td class="px-3 py-2 whitespace-nowrap text-sm">
        <span class="category-badge ${cssClass}">
          ${category}
        </span>
      </td>

      <!-- Details button -->
      <td class="px-3 py-2 whitespace-nowrap text-right text-sm">
        <button
          class="details-btn text-indigo-600 hover:text-indigo-900 font-medium"
          data-student-number="${studentNumber}"
        >
          Details
        </button>
      </td>

      <!-- Active toggle -->
      <td class="px-3 py-2 whitespace-nowrap text-sm">
        <button
          class="toggle-active-btn text-white px-3 py-1 rounded ${toggleClass}"
          data-student-number="${studentNumber}"
        >
          ${toggleLabel}
        </button>
      </td>

    `;
    tbody.appendChild(tr);
  });
}

/**
 * Attaches click listeners to all “Details” buttons in the student table.
 * When clicked, opens a modal and fills in that student's attendance history.
 */
function attachDetailButtonListeners() {
  const buttons = document.querySelectorAll(".details-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const studentNumber = btn.getAttribute("data-student-number");
      if (!studentNumber) return;

      const stu = allStudents.find((s) => s.studentNumber === studentNumber);
      if (!stu) return;

      // Show modal
      document
        .getElementById("studentDetailsContainer")
        .classList.remove("hidden");
      document.getElementById("detailStudentNumber").textContent =
        stu.studentNumber;
      document.getElementById("detailActive").textContent = stu.active
        ? "Yes"
        : "No";

      // Fill attendance history table
      const tbody = document.getElementById("detailAttendanceBody");
      tbody.innerHTML = "";
      const sorted = (stu.attendances || []).slice().sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.week - b.week;
      });

      if (sorted.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="px-3 py-2 text-sm text-gray-500 text-center">
              No attendance data.
            </td>
          </tr>`;
      } else {
        sorted.forEach((att) => {
          const scheduled = att.scheduled || 0;
          const logged = att.logged || 0;
          const pct =
            scheduled > 0 ? Math.round((logged / scheduled) * 100) : 0;
          const category = getCategoryLabel(pct);
          const cssClass =
            "mark-" + category.toLowerCase().replace(/\s+/g, "-");

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${att.year}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${att.week}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${scheduled}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">${logged}</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">${pct}%</td>
            <td class="px-3 py-2 whitespace-nowrap text-sm">
              <span class="category-badge ${cssClass}">${category}</span>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    });
  });
}

function attachToggleButtons() {
  document.querySelectorAll(".toggle-active-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const studentNumber = btn.dataset.studentNumber;
      const stu = allStudents.find((s) => s.studentNumber === studentNumber);
      if (!stu) return;

      // Determine the right endpoint
      const action = stu.active ? "stop" : "start";
      try {
        const resp = await axios.patch(
          `http://145.14.158.244:8000/api/students/${studentNumber}/${action}`
        );
        // Update local state
        stu.active = resp.data.active;
        // Re-render
        applyFilters(); // re-apply filters & redraw table
        // If modal open for this student, update its “Active:” field
        if (
          document
            .getElementById("studentDetailsContainer")
            .classList.contains("hidden") === false
        ) {
          document.getElementById("detailActive").textContent = stu.active
            ? "Yes"
            : "No";
        }
      } catch (err) {
        console.error(`Failed to ${action} student`, err);
        alert("Er is een fout opgetreden. Probeer het opnieuw.");
      }
    });
  });
}

// --------------------------
// Filter Logic
// --------------------------

/**
 * Applies all active filters: group, search, week, year, min/max percentage.
 * Then re-renders the student table.
 */
function applyFilters() {
  const query = document
    .getElementById("studentSearch")
    .value.trim()
    .toLowerCase();

  // Group filter
  const groupVal = document.getElementById("group-select").value; // e.g. "2" or ""
  let groupStudentNumbers = null;
  if (groupVal) {
    // Find the group object whose @id ends in the selected number
    const grp = allGroups.find((g) => {
      const idStr = g["@id"].split("/").pop(); // last segment, e.g. "2"
      return idStr === groupVal;
    });
    if (grp) {
      // Build a Set of studentNumber strings for that group
      groupStudentNumbers = new Set(grp.students.map((s) => s.studentNumber));
    }
  }

  // Week filter
  const weekVal = document.getElementById("week-select").value; // e.g. "2025-21"
  let selYear = null,
    selWeek = null;
  if (weekVal) {
    const [y, w] = weekVal.split("-").map((x) => parseInt(x, 10));
    selYear = y;
    selWeek = w;
  }

  // Year-only filter
  const yearVal = document.getElementById("jaar-select").value; // e.g. "2025"
  const selYearOnly = yearVal ? parseInt(yearVal, 10) : null;

  // Min/Max percentage
  const minRaw = document.getElementById("min-percentage").value;
  const maxRaw = document.getElementById("max-percentage").value;
  const minPct = isNaN(parseInt(minRaw, 10)) ? null : parseInt(minRaw, 10);
  const maxPct = isNaN(parseInt(maxRaw, 10)) ? null : parseInt(maxRaw, 10);

  const filtered = allStudents.filter((stu) => {
    // A) If group is selected, only include students in that group
    if (groupStudentNumbers && !groupStudentNumbers.has(stu.studentNumber)) {
      return false;
    }

    // B) Text search on studentNumber
    if (query && !stu.studentNumber.toLowerCase().includes(query)) {
      return false;
    }

    // C) Find latest attendance record
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

    // If no attendance exists:
    if (!latestAtt) {
      if (selYear !== null && selWeek !== null) return false;
      if (selYearOnly !== null) return false;
      if (minPct !== null || maxPct !== null) return false;
      return true;
    }

    // D) Week filter
    if (selYear !== null && selWeek !== null) {
      if (
        Number(latestAtt.year) !== selYear ||
        Number(latestAtt.week) !== selWeek
      ) {
        return false;
      }
    }

    // E) Year-only filter
    if (selYearOnly !== null) {
      if (Number(latestAtt.year) !== selYearOnly) {
        return false;
      }
    }

    // F) Percentage-range filter
    if (minPct !== null || maxPct !== null) {
      const scheduled = latestAtt.scheduled || 0;
      const logged = latestAtt.logged || 0;
      const pct = scheduled > 0 ? Math.round((logged / scheduled) * 100) : 0;
      if (minPct !== null && pct < minPct) return false;
      if (maxPct !== null && pct > maxPct) return false;
    }

    return true;
  });

  renderStudentTable(filtered);
  attachDetailButtonListeners();
  attachToggleButtons();
}

/**
 * Sets up event listeners on all filter controls:
 *   - #group-select
 *   - #studentSearch
 *   - #week-select
 *   - #jaar-select
 *   - #min-percentage
 *   - #max-percentage
 */
function setupFiltersAndListeners() {
  [
    "group-select",
    "studentSearch",
    "week-select",
    "jaar-select",
    "min-percentage",
    "max-percentage",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", applyFilters);
    el.addEventListener("change", applyFilters);
  });
}

// --------------------------
// Initialization on Page Load
// --------------------------

let allStudents = [];
let allGroups = [];

document.addEventListener("DOMContentLoaded", () => {
  // 1) Fetch all students
  axios
    .get("http://145.14.158.244:8000/api/students")
    .then((resp) => {
      allStudents = resp.data.member || [];

      // 2) Populate year- and week-select dropdowns
      const { uniqueYears, uniqueYearWeeks } =
        extractYearsAndWeeks(allStudents);

      const yearSelect = document.getElementById("jaar-select");
      yearSelect.innerHTML = `<option value="">Alle Jaren</option>`;
      uniqueYears.forEach((yr) => {
        yearSelect.innerHTML += `<option value="${yr}">${yr}</option>`;
      });

      const weekSelect = document.getElementById("week-select");
      weekSelect.innerHTML = `<option value="">Alle Weken</option>`;
      uniqueYearWeeks.forEach((str) => {
        const [y, w] = str.split("-").map((x) => parseInt(x, 10));
        weekSelect.innerHTML += `<option value="${str}">${y} – Week ${w}</option>`;
      });

      // Initially render all students
      renderStudentTable(allStudents);
      attachDetailButtonListeners();
      attachToggleButtons();
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
          </tr>`;
      }
    });

});
