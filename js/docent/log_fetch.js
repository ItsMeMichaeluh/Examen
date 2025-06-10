// js/docent/log_fetch.js

/**
 * Given a raw log object, determine its filename, status label,
 * rowsImported, and errorsCount. Also extract the log’s @id for details.
 */
function normalizeLogEntry(raw) {
  let mediaUrl = "";
  let filename = "Onbekend";
  let mediaObjectId = "";

  if (raw.mediaObject && typeof raw.mediaObject["@id"] === "string") {
    mediaUrl = raw.mediaObject["@id"];
    mediaObjectId = raw.mediaObject["@id"]; // e.g. /api/media_objects/1
    filename = raw.mediaObject.filePath || "Onbekend";
  }

  const statusLabel = mediaUrl ? "✓ Succesvol" : "⚠️ Fout";

  return {
    id: raw["@id"],
    filename,
    statusLabel,
    rowsImported: "—",
    errorsCount: "—",
    mediaUrl,
    mediaObjectId,
    createdAt: raw.createdAt,
  };
}

/**
 * Fetch /api/logs, then populate:
 *  • #importLogContainer  (small panel)
 *  • #importLogBodyModal   (modal table)
 */
function loadImportLogs() {
  axios
    .get("http://145.14.158.244:8000/api/logs")
    .then((resp) => {
      const rawLogs = resp.data.member || [];
      const normalized = rawLogs.map(normalizeLogEntry);

      const tbody = document.getElementById("importLogBodyModal");
      if (tbody) {
        tbody.innerHTML = "";
        if (normalized.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" class="px-3 py-2 text-sm text-gray-500 text-center">
            Geen log‐items in database.</td></tr>`;
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
                <a href="#" class="text-indigo-600 hover:text-indigo-900" data-log-id="${
                  log.id
                }">Details</a>
                |
                <a href="#" class="text-indigo-600 hover:text-indigo-900" data-media-id="${
                  log.mediaObjectId
                }">Bekijk bestand</a>
              </td>
            `;
            tbody.appendChild(tr);
          });

          // Attach click handlers
          tbody.querySelectorAll("[data-log-id]").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
              e.preventDefault();
              const logId = btn.getAttribute("data-log-id");
              try {
                const resp = await axios.get(
                  `http://145.14.158.244:8000${logId}`
                );
                const logDetails = resp.data;
                alert(`Bestandsnaam: ${logDetails.mediaObject.filePath}
Geüpload op: ${new Date(logDetails.createdAt).toLocaleString()}`);
              } catch (err) {
                console.error("Failed to fetch log details:", err);
                alert("Kan details niet ophalen. Probeer het opnieuw.");
              }
            });
          });

          tbody.querySelectorAll("[data-media-id]").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
              e.preventDefault();
              const mediaId = btn.getAttribute("data-media-id");
              try {
                const resp = await axios.get(
                  `http://145.14.158.244:8000${mediaId}`
                );
                const mediaObject = resp.data;
                const contentUrl = mediaObject.contentUrl;
                if (!contentUrl) {
                  alert("Geen content beschikbaar voor dit bestand.");
                  return;
                }
                // Open the file in a new tab
                window.open(
                  `http://145.14.158.244:8000${contentUrl}`,
                  "_blank"
                );

                // Uncomment the above line to download the file directly
                const fileContent = fileResp.data;
                alert(`Inhoud van het logbestand:\n\n${fileContent}`);
              } catch (err) {
                console.error("Failed to fetch log file contents:", err);
                alert("Kan logbestand niet ophalen. Probeer het opnieuw.");
              }
            });
          });
        }
      }
    })
    .catch((err) => {
      console.error("Error fetching /api/logs:", err);
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadImportLogs();
});
