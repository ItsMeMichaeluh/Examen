document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = "http://145.14.158.244:8000/api/students?page=1t";
  const tbody = document.getElementById('dataBody');

  // Pak studentNumber uit URL, default naar st2473322711
  const urlParams = new URLSearchParams(window.location.search);
  const selectedStudentNumber = urlParams.get('studentNumber') || "st2473322711";

  let aanwezigheidData = []; // Globale data om te filteren

  axios.get(apiUrl)
    .then(response => {
      const students = response.data.member;

      // Filter op studentNumber
      const student = students.find(s => s.studentNumber === selectedStudentNumber);
      if (!student) {
        tbody.innerHTML = `
          <tr><td colspan="7" class="text-red-600 text-center py-4">
          Geen student gevonden met studentNumber "${selectedStudentNumber}".
          </td></tr>`;
        return;
      }

      // Vul aanwezigheidData
      aanwezigheidData = student.attendances.map(a => ({
        studentnummer: student.studentNumber,
        jaar: a.year,
        week: a.week,
        aanwezigheid: a.logged,
        rooster: a.scheduled
      }));

      // Sorteer
      aanwezigheidData.sort((a, b) => {
        if (a.jaar !== b.jaar) return a.jaar - b.jaar;
        return a.week - b.week;
      });

      // Init render en eventlisteners
      renderTable(aanwezigheidData);
      document.getElementById('filterJaar').addEventListener('change', applyFilters);
      document.getElementById('filterWeek').addEventListener('change', applyFilters);
    })
    .catch(error => {
      console.error("Fout bij ophalen API-data:", error);
      tbody.innerHTML = `
        <tr><td colspan="7" class="text-red-600 text-center py-4">
          Er ging iets mis bij het laden van de data.
        </td></tr>`;
    });

  // Renders de tabel
  function renderTable(data) {
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="7" class="text-center py-4">
          Geen resultaten gevonden voor deze filter(s).
        </td></tr>`;
      return;
    }

    data.forEach(item => {
      const percentage = item.rooster === 0
        ? 0
        : Math.round((item.aanwezigheid / item.rooster) * 100);

      let score = 'Geen aanwezigheid';
      let bgColor = '#95a5a6';

      if (percentage === 0) {
        score = 'Geen aanwezigheid'; bgColor = '#95a5a6';
      } else if (percentage < 50) {
        score = 'Kritiek'; bgColor = '#e74c3c';
      } else if (percentage < 65) {
        score = 'Onvoldoende'; bgColor = '#f39c12';
      } else if (percentage < 80) {
        score = 'Voldoende'; bgColor = '#ffe066';
      } else if (percentage < 95) {
        score = 'Goed'; bgColor = '#c0e85d';
      } else if (percentage < 100) {
        score = 'Excellent'; bgColor = '#7ddc6e';
      } else {
        score = 'Perfect'; bgColor = '#28a745';
      }

      const row = `
        <tr class="border-b hover:bg-gray-100 text-center">
          <td class="py-2 px-4">${item.studentnummer}</td>
          <td class="py-2 px-4">${item.jaar}</td>
          <td class="py-2 px-4">Week ${item.week}</td>
          <td class="py-2 px-4">${item.aanwezigheid} min</td>
          <td class="py-2 px-4">${item.rooster} min</td>
          <td class="py-2 px-4">${percentage}%</td>
          <td class="py-2 px-4 font-semibold" style="background-color: ${bgColor}; color: white; border-radius: 4px;">
            ${score}
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  }

  // Filterfunctie voor jaar & week
  function applyFilters() {
    const geselecteerdJaar = document.getElementById('filterJaar').value;
    const geselecteerdeWeek = document.getElementById('filterWeek').value;

    const filteredData = aanwezigheidData.filter(item => {
      const matchJaar = geselecteerdJaar === "" || item.jaar.toString() === geselecteerdJaar;
      const matchWeek = geselecteerdeWeek === "" || item.week.toString() === geselecteerdeWeek;
      return matchJaar && matchWeek;
    });

    renderTable(filteredData);
  }
});
