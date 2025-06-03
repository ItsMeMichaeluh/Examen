document.addEventListener('DOMContentLoaded', () => {
  const aanwezigheidData = [
    {
      jaar: 2025,
      week: 23,
      aanwezigheid: 180,
      rooster: 200,
    },
    {
      jaar: 2025,
      week: 24,
      aanwezigheid: 150,
      rooster: 200,
    },
    {
      jaar: 2025,
      week: 25,
      aanwezigheid: 120,
      rooster: 180,
    },
    
    
  ];

  const tbody = document.getElementById('dataBody');

  aanwezigheidData.forEach(item => {
    const percentage = item.rooster === 0 ? 0 : ((item.aanwezigheid / item.rooster) * 100).toFixed(1);

const row = `
  <tr class="border-b border-gray-200 hover:bg-gray-100 transition duration-150 text-center">
    <td class="py-2 px-4 text-center">${item.jaar}</td>
    <td class="py-2 px-4 text-center">Week ${item.week}</td>
    <td class="py-2 px-4 text-center">${item.aanwezigheid} min</td>
    <td class="py-2 px-4 text-center">${item.rooster} min</td>
    <td class="py-2 px-4 font-semibold text-center">${percentage}%</td>
  </tr>
`;

    tbody.insertAdjacentHTML('beforeend', row);
  });
});
