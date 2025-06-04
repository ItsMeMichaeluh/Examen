document.addEventListener("DOMContentLoaded", () => {
  const openBtn = document.getElementById("openLogModal");
  const closeBtn = document.getElementById("closeLogModal");
  const modal = document.getElementById("logModal");

  function showModal() {
    modal.classList.remove("hidden");
  }

  function hideModal() {
    modal.classList.add("hidden");
  }

  openBtn.addEventListener("click", showModal);
  closeBtn.addEventListener("click", hideModal);

  // Sluit modal als gebruiker op de donkere overlay klikt
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });
});
