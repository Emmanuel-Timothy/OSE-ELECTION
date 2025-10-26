async function fetchCounts(detail = false) {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  const url = '/api/livecount' + (detail ? '?detail=true' : '');
  const headers = {};
  if (auth && auth.username) {
    // provide creds for privileged detail endpoint
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!res.ok) {
    document.getElementById('counts')?.textContent = data.error || 'Failed';
    document.getElementById('superviseCounts')?.textContent = data.error || 'Failed';
    return;
  }

  const target = document.getElementById('counts') || document.getElementById('superviseCounts');
  if (data.counts) {
    target.innerHTML = data.counts.map(c => `<div>${c.name}: ${c.votes}</div>`).join('');
  } else {
    target.textContent = 'No data';
  }

  if (detail && data.votes) {
    const det = document.getElementById('voteDetails');
    det.innerHTML = '<h4>Votes</h4>' + data.votes.map(v => `<div>${v.username} → ${v.candidate_name} @ ${v.created_at}</div>`).join('');
  }
}

// Auto-refresh counts every 5 seconds
setInterval(() => fetchCounts(false), 5000);
document.addEventListener('DOMContentLoaded', () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  // If supervisor page, request detail view once
  if (location.pathname.endsWith('supervise.html')) {
    fetchCounts(true);
    setInterval(() => fetchCounts(true), 5000);
  } else {
    fetchCounts(false);
  }
});
