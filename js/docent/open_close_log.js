// js/docent/open_close_log.js

document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openLogModal");
  const closeBtn = document.getElementById("closeLogModal");
  const modal = document.getElementById("logModal");

  if (!openBtn || !closeBtn || !modal) return;

  openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Clicking outside the white dialog (on the overlay) also closes it
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});
