document.addEventListener('DOMContentLoaded', () => {
  const aanwezigheidData = [
  {
    jaar: 2025,
    week: 26,
    aanwezigheid: 160,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 27,
    aanwezigheid: 140,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 28,
    aanwezigheid: 180,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 29,
    aanwezigheid: 90,
    rooster: 170,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 30,
    aanwezigheid: 0,
    rooster: 150,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 31,
    aanwezigheid: 200,
    rooster: 200,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 32,
    aanwezigheid: 120,
    rooster: 150,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 33,
    aanwezigheid: 130,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 34,
    aanwezigheid: 155,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 35,
    aanwezigheid: 80,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 36,
    aanwezigheid: 0,
    rooster: 140,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 37,
    aanwezigheid: 145,
    rooster: 170,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 38,
    aanwezigheid: 170,
    rooster: 170,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 39,
    aanwezigheid: 190,
    rooster: 200,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 40,
    aanwezigheid: 110,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 41,
    aanwezigheid: 105,
    rooster: 150,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 42,
    aanwezigheid: 0,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 43,
    aanwezigheid: 165,
    rooster: 180,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 44,
    aanwezigheid: 100,
    rooster: 160,
    studentnummer: 1234567890
  },
  {
    jaar: 2025,
    week: 45,
    aanwezigheid: 200,
    rooster: 180,
    studentnummer: 1234567890
  }
];

    aanwezigheidData.sort((a, b) => {
    if (a.jaar !== b.jaar) {
      return a.jaar - b.jaar;
    }
    return a.week - b.week;
  });

  const tbody = document.getElementById('dataBody');

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
});
