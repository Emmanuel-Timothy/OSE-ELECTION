document.addEventListener('DOMContentLoaded', async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");
  if (!auth || auth.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  async function api(path, method='GET', body) {
    const headers = {'Content-Type': 'application/json'};
    return fetch(path, { method, headers, body: body ? JSON.stringify(Object.assign({}, body, { username: auth.username, password: auth.password })) : undefined })
      .then(r => r.json().then(j => ({ ok: r.ok, body: j })));
  }

  async function loadUsers() {
    const res = await api('/api/users');
    const container = document.getElementById('usersList');
    if (!res.ok) { container.textContent = res.body.error || 'Failed'; return; }
    container.innerHTML = res.body.map(u => `
      <div>
        ${u.id} - ${u.username} (${u.role})
        <button data-id="${u.id}" class="delUser">Delete</button>
      </div>
    `).join('');
    Array.from(document.querySelectorAll('.delUser')).forEach(b => {
      b.addEventListener('click', async () => {
        await api('/api/users', 'DELETE', { id: Number(b.dataset.id) });
        loadUsers();
      });
    });
  }

  async function loadCandidates() {
    const res = await api('/api/candidates');
    const container = document.getElementById('candidatesAdminList');
    if (!res.ok) { container.textContent = res.body.error || 'Failed'; return; }
    container.innerHTML = res.body.map(c => `
      <div>
        ${c.id} - ${c.name}
        <button data-id="${c.id}" class="delCand">Delete</button>
      </div>
    `).join('');
    Array.from(document.querySelectorAll('.delCand')).forEach(b => {
      b.addEventListener('click', async () => {
        await api('/api/candidates', 'DELETE', { id: Number(b.dataset.id) });
        loadCandidates();
      });
    });
  }

  document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const role = document.getElementById('newRole').value;
    await api('/api/users', 'POST', { username, password, role });
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    loadUsers();
  });

  document.getElementById('createCandidateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('candidateName').value.trim();
    await api('/api/candidates', 'POST', { name });
    document.getElementById('candidateName').value = '';
    loadCandidates();
  });

  await loadUsers();
  await loadCandidates();
});
