document.addEventListener("DOMContentLoaded", () => {
  const groupSelect = document.getElementById("add-to-group-select");
  const addToGroupBtn = document.getElementById("addToGroupBtn");
  const createGroupBtn = document.getElementById("createGroupBtn");
  const groupNameInput = document.getElementById("groupNameInput");

  let groups = [];

  // ✅ Groepen ophalen en dropdown vullen
  const fetchGroups = () => {
    axios
      .get("http://145.14.158.244:8000/api/groups")
      .then((resp) => {
        groups = resp.data["member"] || [];
        console.log("groups: " + groups);
        // groupSelect.innerHTML = `<option value="">-- Selecteer een groep --</option>`;
        groups.forEach((group) => {
          const groupId = group["@id"].split("/").pop();
          console.log(group.name)
          groupSelect.innerHTML += `<option value="${groupId}">${group.name}</option>`;
        });
      })
      .catch((err) => {
        console.error("💥 Fout bij ophalen groepen:", err);
        alert("❌ Kan groepen niet ophalen.");
      });
  };

  fetchGroups();

  // ✅ Groep aanmaken (zonder studenten)
  createGroupBtn.addEventListener("click", async () => {
    const groupName = groupNameInput.value.trim();

    if (!groupName) {
      alert("❌ Vul een groepsnaam in.");
      return;
    }

    try {
      const response = await fetch("http://145.14.158.244:8000/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json"
        },
        body: JSON.stringify({ name: groupName })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Fout:", data);
        alert(`❌ Fout bij aanmaken groep: ${data.detail || "Onbekende fout"}`);
        return;
      }

      alert(`✅ Groep '${groupName}' succesvol aangemaakt!`);
      groupNameInput.value = "";
      fetchGroups();
    } catch (err) {
      console.error("Netwerkfout:", err);
      alert("❌ Netwerkfout bij het aanmaken van de groep.");
    }
  });

  // ✅ Studenten toevoegen aan geselecteerde groep
  addToGroupBtn.addEventListener("click", async () => {
    const groupId = groupSelect.value;

    if (!groupId) {
      alert("❌ Kies een groep.");
      return;
    }

    const selectedCheckboxes = document.querySelectorAll(".student-checkbox:checked");
    const studentNumbers = Array.from(selectedCheckboxes).map(
      (cb) => cb.dataset.studentNumber
    );

    if (studentNumbers.length === 0) {
      alert("❌ Selecteer minstens één student.");
      return;
    }

    try {
      const res = await fetch(`http://145.14.158.244:8000/api/groups/${groupId}/add-students`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Accept: "application/ld+json",
        },
        body: JSON.stringify({ studentNumbers: studentNumbers })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Fout bij toevoegen aan groep:", data);
        alert(`❌ Fout bij toevoegen: ${data.detail || JSON.stringify(data)}`);
        return;
      }

      alert(`✅ ${studentNumbers.length} student(en) toegevoegd aan groep '${data.name}'.`);
    } catch (err) {
      console.error("Netwerkfout:", err);
      alert("❌ Netwerkfout bij toevoegen.");
    }
  });

});
