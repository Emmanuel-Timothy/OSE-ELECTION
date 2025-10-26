const MAX = 3;
async function loadCandidates() {
  const el = document.getElementById('candidates');
  try {
    const res = await fetch('/api/livecount');
    const data = await res.json();
    if (!Array.isArray(data)) { el.textContent = 'Failed to load candidates'; return; }
    el.innerHTML = data.map(c => `
      <label>
        <input type="checkbox" name="candidate" value="${c.id}">
        ${c.name} (${c.votes} votes)
      </label><br>
    `).join('');
    // enforce max selection
    const checkboxes = el.querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(cb => cb.addEventListener('change', () => {
      const checked = el.querySelectorAll('input[type=checkbox]:checked');
      if (checked.length > MAX) {
        cb.checked = false;
        alert('You can select up to ' + MAX + ' candidates');
      }
    }));
  } catch (e) {
    document.getElementById('candidates').textContent = 'Error loading';
  }
}

document.getElementById('voteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const selected = Array.from(document.querySelectorAll('#candidates input[type=checkbox]:checked')).map(i => Number(i.value));
  if (selected.length === 0) { document.getElementById('voteResult').textContent = 'Select at least one candidate'; return; }
  if (selected.length > MAX) { document.getElementById('voteResult').textContent = `Max ${MAX}`; return; }

  const token = localStorage.getItem('token') || '';
  const res = await fetch('/api/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ candidate_ids: selected })
  });
  const j = await res.json();
  document.getElementById('voteResult').textContent = JSON.stringify(j);
  if (res.ok) loadCandidates(); // refresh counts
});

loadCandidates();
