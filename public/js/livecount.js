async function fetchCounts(detail = false) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const url = '/api/livecount' + (detail ? '?detail=true' : '');
  const headers = {};
  if (auth && auth.username) {
    headers['Content-Type'] = 'application/json';
    // send credentials for detail endpoint
    headers['x-username'] = auth.username;
    headers['x-password'] = auth.password;
  }
  const res = await fetch(url, { headers });
  const data = await res.json();
  // Find the correct target element
  const countsEl = document.getElementById('counts');
  const superviseEl = document.getElementById('superviseCounts');
  if (!res.ok) {
    if (countsEl) countsEl.textContent = data.error || 'Failed';
    if (superviseEl) superviseEl.textContent = data.error || 'Failed';
    return;
  }
  if (data.counts) {
    const html = data.counts.map(c => `<div>${c.name}: ${c.votes}</div>`).join('');
    if (countsEl) countsEl.innerHTML = html;
    if (superviseEl) superviseEl.innerHTML = html;
  } else {
    if (countsEl) countsEl.textContent = 'No data';
    if (superviseEl) superviseEl.textContent = 'No data';
  }
  if (detail && data.votes) {
    const det = document.getElementById('voteDetails');
    if (det) {
      det.innerHTML = '<h4>Votes</h4>' + data.votes.map(v => `<div>${v.username} → ${v.candidate_name} @ ${v.created_at}</div>`).join('');
    }
  }
}

// Only auto-refresh on livecount.html and supervise.html
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname;
  if (path.endsWith('livecount.html')) {
    fetchCounts(false);
    setInterval(() => fetchCounts(false), 5000);
  } else if (path.endsWith('supervise.html')) {
    fetchCounts(true);
    setInterval(() => fetchCounts(true), 5000);
  }
});
