document.getElementById('importBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  if (!fileInput.files.length) {
    alert('Selecteer eerst een Excel-bestand!');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('type', 'excel_import');

  status.textContent = "Bezig met uploaden...";

  fetch('http://145.14.158.244:8000/api/media_objects/import', {
    method: 'POST',
    headers: {
      'accept': 'application/ld+json'
      // Let op: Content-Type laat je weg bij multipart/form-data, dat doet fetch automatisch
    },
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error(`Fout: ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    status.textContent = "Upload succesvol!";
    console.log("Response:", data);
  })
  .catch(err => {
    status.textContent = "Upload mislukt!";
    console.error(err);
  });
});
