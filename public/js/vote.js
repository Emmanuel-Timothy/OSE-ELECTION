const MAX = 3;
async function loadCandidates() {
  const el = document.getElementById('candidates');
  try {
    const res = await fetch('/api/livecount');
    const data = await res.json();
    if (!Array.isArray(data)) { el.textContent = 'Failed to load candidates'; return; }
    el.innerHTML = data.map(c => `
      <label>
        <input type="radio" name="candidate" value="${c.id}">
        ${c.name} (${c.votes} votes)
      </label><br>
    `).join('');
  } catch (e) {
    document.getElementById('candidates').textContent = 'Error loading';
  }
}

document.getElementById('voteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const selected = document.querySelector('#candidates input[type=radio]:checked');
  if (!selected) { document.getElementById('voteResult').textContent = 'Select a candidate'; return; }
  const candidate_id = Number(selected.value);

  const token = localStorage.getItem('token') || '';
  const res = await fetch('/api/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ candidate_id })
  });
  const j = await res.json();
  document.getElementById('voteResult').textContent = JSON.stringify(j);
  if (res.ok) loadCandidates(); // refresh counts
});

loadCandidates();
