document.getElementById("createGroupBtn").addEventListener("click", async () => {
  const groupName = document.getElementById("groupNameInput").value.trim();

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
    document.getElementById("groupNameInput").value = "";
  } catch (err) {
    console.error("Netwerkfout:", err);
    alert("❌ Netwerkfout bij het aanmaken van de groep.");
  }
});
