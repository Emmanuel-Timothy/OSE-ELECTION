document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (!auth || !auth.username) {
    window.location.href = "index.html";
    return;
  }

  const list = document.getElementById("candidatesList");
  const form = document.getElementById("voteForm");
  const msg = document.getElementById("voteMsg");
  const logoutBtn = document.getElementById("logoutBtn"); // 👈 reference logout button

  // Handle logout click
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("auth"); // remove auth info
    window.location.href = "index.html"; // redirect back to login page
  });

  // Load candidates dynamically
  async function loadCandidates() {
    const res = await fetch('/api/candidates');
    const data = await res.json();
    if (!res.ok) {
      list.textContent = data.error || 'Failed to load';
      return;
    }
    list.innerHTML = data.map(c => `
      <label><input type="radio" name="candidate" value="${c.id}"> ${c.name}</label><br>
    `).join('');
  }

  // 🔹 Handle vote submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const selected = document.querySelector('input[name="candidate"]:checked');
    if (!selected) {
      msg.textContent = 'Please select a candidate.';
      return;
    }

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: auth.username,
          password: auth.password,
          candidate_id: Number(selected.value)
        })
      });
      const data = await res.json();
      if (!res.ok) {
        msg.textContent = data.error || 'Vote failed';
        return;
      }
      msg.style.color = 'green';
      msg.textContent = 'Vote submitted. Thank you.';
      // Disable form to prevent multiple votes
      Array.from(document.querySelectorAll('input')).forEach(i => i.disabled = true);
    } catch (err) {
      console.error(err);
      msg.textContent = 'Server error';
    }
  });

  await loadCandidates();
});
