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

      // Sorteer op jaar en week
      aanwezigheidData.sort((a, b) => {
        if (a.jaar !== b.jaar) return a.jaar - b.jaar;
        return a.week - b.week;
      });

      // Maak rijen aan
      aanwezigheidData.forEach(item => {
        const percentage = item.rooster === 0 ? 0 : Math.round((item.aanwezigheid / item.rooster) * 100);

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
      console.error("Fout bij ophalen van data:", err);
      tbody.innerHTML = `<tr><td colspan="7">Er ging iets mis bij het laden van de data.</td></tr>`;
    });
});
