document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = "http://10.37.85.147:8000/api/students";
  const tbody = document.getElementById('dataBody');

  fetch(apiUrl)
    .then(res => {
      if (!res.ok) throw new Error("Kon data niet ophalen van de API");
      return res.json();
    })
    .then(data => {
      const students = data.member;

      // Bouw een platte lijst op van alle attendance entries
      const aanwezigheidData = [];

      students.forEach(student => {
        const studentnummer = student.studentNumber;
        student.attendances.forEach(a => {
          aanwezigheidData.push({
            studentnummer,
            jaar: a.year,
            week: a.week,
            aanwezigheid: a.logged,
            rooster: a.scheduled
          });
        });
      });

      // (Optioneel) sorteer op jaar en week
      aanwezigheidData.sort((a, b) => {
        if (a.jaar !== b.jaar) {
          return a.jaar - b.jaar;
        }
        return a.week - b.week;
      });

      // Bereid chart-data voor
      const labels = aanwezigheidData.map(item => `Week ${item.week}`);
      const percentages = aanwezigheidData.map(item =>
        item.rooster === 0 ? 0 : ((item.aanwezigheid / item.rooster) * 100).toFixed(1)
      );
      const roosterPercentages = aanwezigheidData.map(() => 100); // 100% balk voor rooster

      const ctx = document.getElementById('aanwezigheidChart').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
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
                callback: (value) => `${value}%`
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });

      // (Optioneel) Tabel vullen met aanwezigheidData
      aanwezigheidData.forEach(item => {
        const percentage = item.rooster === 0
          ? 0
          : Math.round((item.aanwezigheid / item.rooster) * 100);

        let score = 'Geen aanwezigheid';
        let bgColor = '#95a5a6'; // default grijs

        if (percentage === 0) {
          score = 'Geen aanwezigheid';
          bgColor = '#95a5a6';
        } else if (percentage < 50) {
          score = 'Kritiek';
          bgColor = '#e74c3c';
        } else if (percentage < 65) {
          score = 'Onvoldoende';
          bgColor = '#f39c12';
        } else if (percentage < 80) {
          score = 'Voldoende';
          bgColor = '#ffe066';
        } else if (percentage < 95) {
          score = 'Goed';
          bgColor = '#c0e85d';
        } else if (percentage < 100) {
          score = 'Excellent';
          bgColor = '#7ddc6e';
        } else if (percentage <= 120) {
          score = 'Perfect';
          bgColor = '#28a745';
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
    });
});
