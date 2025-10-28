document.addEventListener('DOMContentLoaded', async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  // Redirect if not admin
  if (!auth || auth.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // Universal API helper
  async function api(path, method = 'GET', body) {
    try {
      const headers = { 'Content-Type': 'application/json' };

      // Send admin credentials separately
      const payload = body
        ? { ...body, adminUser: auth.username, adminPass: auth.password }
        : { adminUser: auth.username, adminPass: auth.password };

      const res = await fetch(path, {
        method,
        headers,
        body: method === 'GET' ? undefined : JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, body: json };
    } catch (err) {
      console.error('API Error:', err);
      return { ok: false, body: { error: 'Network or server error' } };
    }
  }

  // Load users
  async function loadUsers() {
    const container = document.getElementById('usersList');
    if (!container) return;
    container.textContent = 'Loading...';

    const res = await api('/api/users');
    if (!res.ok) {
      container.textContent = res.body.error || 'Failed to load users';
      return;
    }

    container.innerHTML = res.body
      .map(
        (u) => `
      <div>
        ${u.id} - ${u.username} (${u.role})
        <button data-id="${u.id}" class="delUser">Delete</button>
      </div>`
      )
      .join('');

    document.querySelectorAll('.delUser').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this user?')) return;
        const del = await api('/api/users', 'DELETE', { id: Number(btn.dataset.id) });
        if (!del.ok) alert(del.body.error || 'Failed to delete user');
        loadUsers();
      })
    );
  }

  // Load candidates
  async function loadCandidates() {
    const container = document.getElementById('candidatesAdminList');
    if (!container) return;
    container.textContent = 'Loading...';

    const res = await api('/api/candidates');
    if (!res.ok) {
      container.textContent = res.body.error || 'Failed to load candidates';
      return;
    }

    container.innerHTML = res.body
      .map(
        (c) => `
      <div>
        ${c.id} - ${c.name}
        <button data-id="${c.id}" class="delCand">Delete</button>
      </div>`
      )
      .join('');

    document.querySelectorAll('.delCand').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this candidate?')) return;
        const del = await api('/api/candidates', 'DELETE', { id: Number(btn.dataset.id) });
        if (!del.ok) alert(del.body.error || 'Failed to delete candidate');
        loadCandidates();
      })
    );
  }

  // Create new user
  document.getElementById('createUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const role = document.getElementById('newRole').value;

    if (!username || !password) return alert('Please fill all fields.');

    const res = await api('/api/users', 'POST', { username, password, role });
    if (!res.ok) alert(res.body.error || 'Failed to create user');

    e.target.reset();
    loadUsers();
  });

  // Create new candidate
  document.getElementById('createCandidateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('candidateName').value.trim();

    if (!name) return alert('Please enter candidate name.');

    const res = await api('/api/candidates', 'POST', { name });
    if (!res.ok) alert(res.body.error || 'Failed to create candidate');

    e.target.reset();
    loadCandidates();
  });

  // Initial load
  await loadUsers();
  await loadCandidates();
});
