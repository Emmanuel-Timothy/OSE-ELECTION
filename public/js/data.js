document.addEventListener('DOMContentLoaded', async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  // redirect non-admins to index.html
  if (!auth || auth.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // simple API wrapper with error handling
  async function api(path, method = 'GET', body) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const res = await fetch(path, {
        method,
        headers,
        body: body
          ? JSON.stringify({ ...body, username: auth.username, password: auth.password })
          : undefined,
      });

      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, body: json };
    } catch (err) {
      console.error('API Error:', err);
      return { ok: false, body: { error: 'Network error or invalid response.' } };
    }
  }

  // 🧍 Load Users
  async function loadUsers() {
    const container = document.getElementById('usersList');
    if (!container) return;

    container.innerHTML = 'Loading users...';
    const res = await api('/api/users');
    if (!res.ok) {
      container.textContent = res.body.error || 'Failed to load users';
      return;
    }

    container.innerHTML = res.body.map(u => `
      <div class="user-item">
        <strong>${u.id}</strong> - ${u.username} (${u.role})
        <button data-id="${u.id}" class="delUser">🗑️ Delete</button>
      </div>
    `).join('');

    document.querySelectorAll('.delUser').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this user?')) return;
        const delRes = await api('/api/users', 'DELETE', { id: Number(btn.dataset.id) });
        if (!delRes.ok) alert(delRes.body.error || 'Failed to delete user');
        loadUsers();
      });
    });
  }

  async function loadCandidates() {
    const container = document.getElementById('candidatesAdminList');
    if (!container) return;

    container.innerHTML = 'Loading candidates...';
    const res = await api('/api/candidates');
    if (!res.ok) {
      container.textContent = res.body.error || 'Failed to load candidates';
      return;
    }

    container.innerHTML = res.body.map(c => `
      <div class="candidate-item">
        <strong>${c.id}</strong> - ${c.name}
        <button data-id="${c.id}" class="delCand">🗑️ Delete</button>
      </div>
    `).join('');

    document.querySelectorAll('.delCand').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this candidate?')) return;
        const delRes = await api('/api/candidates', 'DELETE', { id: Number(btn.dataset.id) });
        if (!delRes.ok) alert(delRes.body.error || 'Failed to delete candidate');
        loadCandidates();
      });
    });
  }

  const userForm = document.getElementById('createUserForm');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const password = document.getElementById('newPassword').value.trim();
      const role = document.getElementById('newRole').value;

      if (!username || !password) return alert('Please fill in all fields.');

      const res = await api('/api/users', 'POST', { username, password, role });
      if (!res.ok) alert(res.body.error || 'Failed to create user');

      userForm.reset();
      loadUsers();
    });
  }

  const candForm = document.getElementById('createCandidateForm');
  if (candForm) {
    candForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('candidateName').value.trim();

      if (!name) return alert('Please enter a candidate name.');

      const res = await api('/api/candidates', 'POST', { name });
      if (!res.ok) alert(res.body.error || 'Failed to create candidate');

      candForm.reset();
      loadCandidates();
    });
  }

  // Initial load
  await loadUsers();
  await loadCandidates();
});
