async function load() {
  try {
    const res = await fetch('/api/livecount');
    const data = await res.json();
    const el = document.getElementById('liveResults');
    if (!Array.isArray(data)) { el.textContent = JSON.stringify(data); return; }
    el.innerHTML = '<table><tr><th>id</th><th>candidate</th><th>votes</th></tr>' +
      data.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.votes}</td></tr>`).join('') +
      '</table>';
  } catch (e) {
    document.getElementById('liveResults').textContent = 'Error loading';
  }
}
document.getElementById('refresh').addEventListener('click', load);
load();
