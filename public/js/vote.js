document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (!auth || !auth.username) {
    window.location.href = "index.html";
    return;
  }

  const list = document.getElementById("candidatesList");
  const form = document.getElementById("voteForm");
  const msg = document.getElementById("voteMsg");

  // Load candidates dynamically
  async function loadCandidates() {
    const res = await fetch('/api/candidates');
    const data = await res.json().catch(() => ({ error: 'Invalid response' }));
    if (!res.ok) {
      list.textContent = data.error || 'Failed to load';
      return;
    }
    // Render horizontally with flex
    list.innerHTML = data.map((c, idx) => `
      <div class="gate candidate-box">
        <img src="PH.png" alt="Candidate Image" class="candidate-img">
        <h2 class="gate-title">GATE ${idx+1}</h2>
        <p class="candidate-name">${c.name}</p>
        <h3>Vision</h3>
        <ul>${(c.vision || []).map(v => `<li>${v}</li>`).join('')}</ul>
        <h3>Mission</h3>
        <ul>${(c.mission || []).map(m => `<li>${m}</li>`).join('')}</ul>
        <button type="button" class="vote-btn" data-candidate="${c.id}">VOTE</button>
      </div>
    `).join('');
    // Attach click handler for each vote button
    Array.from(list.querySelectorAll('.vote-btn')).forEach(btn => {
      btn.onclick = async () => {
        if (form.querySelector('button[type="submit"]')) form.querySelector('button[type="submit"]').disabled = true;
        msg.textContent = '';
        const candidateId = Number(btn.getAttribute('data-candidate'));
        try {
          const res = await fetch('/api/vote', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              username: auth.username,
              password: auth.password,
              candidate_id: candidateId
            })
          });
          const data = await res.json().catch(() => ({ error: 'Invalid response' }));
          if (!res.ok) {
            msg.textContent = data.error || 'Vote failed';
            return;
          }
          msg.style.color = 'green';
          msg.textContent = 'Vote submitted. Thank you.';
          // Disable all vote buttons after voting
          Array.from(list.querySelectorAll('.vote-btn')).forEach(b => b.disabled = true);
        } catch (err) {
          console.error(err);
          msg.textContent = 'Server error';
        }
      };
    });
  }

  // Remove default form submit behavior
  form.onsubmit = e => e.preventDefault();

  await loadCandidates();
});
