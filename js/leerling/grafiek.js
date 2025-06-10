document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = "http://145.14.158.244:8000/api/students?page=1t";
  const tbody = document.getElementById('dataBody');

  // Pak studentNumber uit URL, fallback op default
  const urlParams = new URLSearchParams(window.location.search);
  const selectedStudentNumber = urlParams.get('studentNumber') || "st1121615364";

  // Laat studentnummer zien in de navbar
  const studentNummerDisplay = document.getElementById('studentNummerDisplay');
  if (studentNummerDisplay) {
    studentNummerDisplay.textContent = `Studentnummer: ${selectedStudentNumber}`;
  }

  axios.get(apiUrl)
    .then(response => {
      const data = response.data;
      const students = data.member;

      // Filter alleen die ene student eruit
      const student = students.find(s => s.studentNumber === selectedStudentNumber);

      if (!student) {
        tbody.innerHTML = `
          <tr><td colspan="7" class="text-red-600 text-center py-4">
          Geen student gevonden met studentNumber "${selectedStudentNumber}".
          </td></tr>`;
        return;
      }

      // Platte lijst van attendance van alleen die ene student
      const aanwezigheidData = student.attendances.map(a => ({
        studentnummer: student.studentNumber,
        jaar: a.year,
        week: a.week,
        aanwezigheid: a.logged,
        rooster: a.scheduled
      }));

      aanwezigheidData.sort((a, b) => {
        if (a.jaar !== b.jaar) return a.jaar - b.jaar;
        return a.week - b.week;
      });

      // Chart data
      const labels = aanwezigheidData.map(item => `Week ${item.week}`);
      const percentages = aanwezigheidData.map(item =>
        item.rooster === 0 ? 0 : ((item.aanwezigheid / item.rooster) * 100).toFixed(1)
      );
      const roosterPercentages = aanwezigheidData.map(() => 100);

      const ctx = document.getElementById('aanwezigheidChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Aanwezigheid (%)',
              data: percentages,
              backgroundColor: 'rgba(59, 130, 246, 0.6)', // Tailwind blue
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            },
            {
              label: 'Rooster (%)',
              data: roosterPercentages,
              backgroundColor: 'rgba(239, 68, 68, 0.6)', // Tailwind red
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 120,
              title: {
                display: true,
                text: 'Percentage'
              },
              ticks: {
                callback: value => `${value}%`
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.raw}%`
              }
            }
          }
        }
      });

      // Tabel vullen
      aanwezigheidData.forEach(item => {
        const percentage = item.rooster === 0 ? 0 : Math.round((item.aanwezigheid / item.rooster) * 100);

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
        } else if (percentage <= 120) {
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
            <td class="py-2 px-4 font-semibold" style="background-color: ${bgColor};">
              ${score}
            </td>
          </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
      });

    })
    .catch(err => {
      console.error("Fout bij ophalen van API-data:", err);
      tbody.innerHTML = `<tr><td colspan="7">Er ging iets mis bij het laden van de data.</td></tr>`;
    });
});
