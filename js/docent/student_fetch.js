// js/docent/student_fetch.js

let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
  // 1) Fetch ALL students from the API:
  axios
    .get("http://145.14.158.244:8000/api/students")
    .then((resp) => {
      allStudents = resp.data.member || [];
      renderStudentTable(allStudents);
      attachDetailButtonListeners();
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
 * Returns a pseudo‐random “fake” name (First Last) for any given studentNumber.
 * We hash the string to a number, then pick a first name and last name from arrays.
 * This ensures each studentNumber always maps to the same fake name.
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
    "Task",
    "Mila",
    "Finn",
    "Sara",
    "Sem",
    "Lotte",
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

  // Simple hash: sum of char codes
  let hash = 0;
  for (let i = 0; i < studentNumber.length; i++) {
    hash = (hash << 5) - hash + studentNumber.charCodeAt(i);
    hash |= 0; // bitwise to keep it 32-bit
  }
  // Make positive
  hash = Math.abs(hash);

  const firstIndex = hash % firstNames.length;
  const lastIndex = Math.floor(hash / firstNames.length) % lastNames.length;

  return `${firstNames[firstIndex]} ${lastNames[lastIndex]}`;
}

/**
 * Renders an array of Student objects into <tbody id="studentTableBody">.
 * Each student object has:
 *   - studentNumber: string
 *   - active: boolean
 *   - attendances: [ { year, week, scheduled, logged }, … ]
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
    // Generate a fake name based on studentNumber:
    const name = generateFakeName(studentNumber);

    // Find the “latest” attendance record by (year, week):
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

    // Default placeholders if no attendance:
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

      // Determine category:
      if (pct >= 100) category = "Perfect";
      else if (pct >= 95) category = "Excellent";
      else if (pct >= 80) category = "Goed";
      else if (pct >= 65) category = "Voldoende";
      else if (pct >= 50) category = "Onvoldoende";
      else if (pct > 0) category = "Kritiek";
      else category = "Geen Aanwezigheid";
    }

    // Build the table row, including a “Details” button with data-student-number:
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${studentNumber}
      </td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${name}
      </td>
      <td class="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-800">
        ${pctText}
      </td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${logged}
      </td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${scheduled}
      </td>
      <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
        ${category}
      </td>
      <td class="px-3 py-2 whitespace-nowrap text-right text-sm">
        <button
          class="details-btn text-indigo-600 hover:text-indigo-900 font-medium"
          data-student-number="${studentNumber}"
        >
          Details
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * After rendering the table, attach a click handler to every .details-btn.
 * When clicked, show the “Student Details” panel and populate it with the correct data.
 */
function attachDetailButtonListeners() {
  const buttons = document.querySelectorAll(".details-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const studentNumber = btn.getAttribute("data-student-number");
      if (!studentNumber) return;

      // Find that student in allStudents:
      const stu = allStudents.find((s) => s.studentNumber === studentNumber);
      if (!stu) return;

      // 1) Unhide the modal:
      const container = document.getElementById("studentDetailsContainer");
      container.classList.remove("hidden");

      // 2) Fill in studentNumber + active:
      document.getElementById("detailStudentNumber").textContent =
        stu.studentNumber;
      document.getElementById("detailActive").textContent = stu.active
        ? "Yes"
        : "No";

      // 3) Populate the attendance table body (#detailAttendanceBody):
      const tbody = document.getElementById("detailAttendanceBody");
      tbody.innerHTML = "";

      // Sort by year→week ascending (optional), so oldest first:
      const sorted = (stu.attendances || []).slice().sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.week - b.week;
      });

      if (sorted.length === 0) {
        // If no records, show a “no attendance” row
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="px-3 py-2 text-sm text-gray-500 text-center">
              Geen aanwezigheidsdata.
            </td>
          </tr>
        `;
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
