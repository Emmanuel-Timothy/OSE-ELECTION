document.addEventListener("DOMContentLoaded", async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (!auth || !auth.username) {
    window.location.href = "index.html";
    return;
  }

  const list = document.getElementById("candidatesList");
  const form = document.getElementById("voteForm");
  const msg = document.getElementById("voteMsg");
  const modal = document.getElementById("voteModal");

  // Hardcoded candidates
  const candidates = [
    {
      id: 1,
      name: "Alea x Cing-cing",
      vision: "To build a structured, professional, and approachable organization that strengthens communication, improves internal systems, and develops sustainable initiatives for a more effective and impactful OSE.",
      mission: [
        "Enhance members' responsibility and leadership skills.",
        "Foster open and transparent communication.",
        "Develop meaningful student projects.",
        "Ensure all initiatives align with core values and benefit the school community."
      ]
    },
    {
      id: 2,
      name: "Isabella x Shannon",
      vision: "A community where students express their ideas and creativity, fostering character development through innovation, collaboration, and environmental awareness.",
      mission: [
        "Strengthen student representation, transparency, and connection with school events.",
        "Promote fairness, collaboration, and engagement among all students.",
        "Encourage the 5C 1E values: create, collaborate, care, communicate, think critically, and empower others."
      ]
    }
  ];

  // Load candidates dynamically
  async function loadCandidates() {
    list.innerHTML = candidates.map((c, idx) => `
      <div class="gate candidate-box">
        <img src="public/asset/Candidate${idx+1}.jpg" alt="Candidate Image" class="candidate-img">
        <h2 class="gate-title">GATE ${idx+1}</h2>
        <p class="candidate-name">${c.name}</p>
        <h3>Vision</h3>
        <p>${c.vision}</p>
        <h3>Mission</h3>
        <ul>${c.mission.map(m => `<li>${m}</li>`).join('')}</ul>
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
          // Show success modal
          modal.classList.add('show');
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
