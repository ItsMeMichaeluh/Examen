// js/docent/log_fetch.js

/**
 * Given a raw log object, determine its filename, status label,
 * rowsImported, and errorsCount.  We also handle the case where
 * mediaObject may be an object rather than a string.
 */
function normalizeLogEntry(raw) {
  // 1) Extract the URL string into mediaUrl
  let mediaUrl = "";
  if (typeof raw.mediaObject === "string") {
    mediaUrl = raw.mediaObject;
  } else if (raw.mediaObject && typeof raw.mediaObject["@id"] === "string") {
    mediaUrl = raw.mediaObject["@id"];
  }

  // 2) Filename is whatever comes after the last '/'
  const filename = mediaUrl.split("/").pop();

  // 3) Status label: if there is a mediaUrl, consider it "✓ Succesvol"
  //    otherwise mark it as an error
  const statusLabel = mediaUrl ? "✓ Succesvol" : "⚠️ Fout";

  // 4) If your API returns rowsImported / errors fields, use them;
  //    otherwise show a placeholder “—”
  const rowsImported = raw.rowsImported != null ? raw.rowsImported : "—";
  const errorsCount = raw.errors != null ? raw.errors : "—";

  return {
    id: raw.id,
    filename,
    statusLabel,
    rowsImported,
    errorsCount,
    mediaUrl,
  };
}

/**
 * Fetch /api/logs, then populate both:
 *  • #importLogContainer  (small panel)
 *  • #importLogBodyModal   (modal table)
 */
function loadImportLogs() {
  axios
    .get("http://145.14.158.244:8000/api/logs")
    .then((resp) => {
      const rawLogs = resp.data.member || [];
      const normalized = rawLogs.map(normalizeLogEntry);

      // --- A) Populate the small panel (#importLogContainer) ---
      const container = document.getElementById("importLogContainer");
      if (container) {
        container.innerHTML = "";
        if (normalized.length === 0) {
          container.innerHTML = `
            <div class="px-3 py-2 text-sm text-gray-500 text-center">
              Geen import‐logberichten gevonden.
            </div>`;
        } else {
          normalized.forEach((log) => {
            const entryDiv = document.createElement("div");
            entryDiv.className =
              "flex flex-col md:flex-row md:items-center md:justify-between";
            entryDiv.innerHTML = `
              <div class="flex items-center space-x-2">
                <span class="text-gray-800 font-medium">${log.filename}</span>
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  log.statusLabel.startsWith("✓")
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }">${log.statusLabel}</span>
              </div>
              <div class="flex space-x-4 text-sm text-gray-600 mt-2 md:mt-0">
                <span>Rijen geïmporteerd: <strong>${
                  log.rowsImported
                }</strong></span>
                <span>Fouten: <strong>${log.errorsCount}</strong></span>
                <a href="${
                  log.mediaUrl
                }" target="_blank" class="text-indigo-600 hover:text-indigo-900 font-medium">
                  Details
                </a>
              </div>
            `;
            container.appendChild(entryDiv);
          });
        }
      }

      // --- B) Populate the modal table (#importLogBodyModal) ---
      const tbody = document.getElementById("importLogBodyModal");
      if (tbody) {
        tbody.innerHTML = "";
        if (normalized.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="px-3 py-2 text-sm text-gray-500 text-center">
                Geen log‐items in database.
              </td>
            </tr>`;
        } else {
          normalized.forEach((log) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td class="px-3 py-2 text-gray-700">${log.filename}</td>
              <td class="px-3 py-2">
                <span class="${
                  log.statusLabel.startsWith("✓")
                    ? "inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full"
                    : "inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full"
                }">${log.statusLabel}</span>
              </td>
              <td class="px-3 py-2 text-gray-700">${log.rowsImported}</td>
              <td class="px-3 py-2 text-gray-700">${log.errorsCount}</td>
              <td class="px-3 py-2">
                <a href="${
                  log.mediaUrl
                }" target="_blank" class="text-indigo-600 hover:text-indigo-900">
                  Details
                </a>
              </td>
            `;
            tbody.appendChild(tr);
          });
        }
      }
    })
    .catch((err) => {
      console.error("Error fetching /api/logs:", err);
      const container = document.getElementById("importLogContainer");
      if (container) {
        container.innerHTML = `
          <div class="px-3 py-2 text-sm text-red-600 text-center">
            Fout bij het laden van import‐log.
          </div>`;
      }
      const tbody = document.getElementById("importLogBodyModal");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="px-3 py-2 text-sm text-red-600 text-center">
              Fout bij het laden van log‐gegevens.
            </td>
          </tr>`;
      }
    });
}

// Call loadImportLogs() once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadImportLogs();
});
