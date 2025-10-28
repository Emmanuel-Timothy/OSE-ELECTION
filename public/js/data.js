document.addEventListener('DOMContentLoaded', async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  if (!auth || auth.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // universal API handler
  async function api(path, method = 'GET', body) {
    try {
      const headers = { 'Content-Type': 'application/json' };

      // send admin creds separately for verification (not overwriting body)
      const payload = body
        ? { ...body, adminUser: auth.username, adminPass: auth.password }
        : { adminUser: auth.username, adminPass: auth.password };

      const res = await fetch(path, {
        method,
        headers,
        body: ['GET'].includes(method) ? undefined : JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, body: json };
    } catch (err) {
      console.error('API Error:', err);
      return { ok: false, body: { error: 'Network or server error' } };
    }
  }

  // load users
  async function loadUsers() {
    const container = document.getElementById('usersList');
    if (!container) return;
    container.textContent = 'Loading...';
    const res = await api('/api/users');
    if (!res.ok) return (container.textContent = res.body.error || 'Failed to load');

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
        await api('/api/users', 'DELETE', { id: Number(btn.dataset.id) });
        loadUsers();
      })
    );
  }

  // load candidates
  async function loadCandidates() {
    const container = document.getElementById('candidatesAdminList');
    if (!container) return;
    container.textContent = 'Loading...';
    const res = await api('/api/candidates');
    if (!res.ok) return (container.textContent = res.body.error || 'Failed to load');

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
        await api('/api/candidates', 'DELETE', { id: Number(btn.dataset.id) });
        loadCandidates();
      })
    );
  }

  // create new user
  document.getElementById('createUserForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value.trim();
    const role = document.getElementById('newRole').value;
    if (!username || !password) return alert('Please fill in all fields');

    await api('/api/users', 'POST', { username, password, role });
    e.target.reset();
    loadUsers();
  });

  // create new candidate
  document.getElementById('createCandidateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('candidateName').value.trim();
    if (!name) return alert('Please enter a candidate name.');

    await api('/api/candidates', 'POST', { name });
    e.target.reset();
    loadCandidates();
  });

  // initial load
  await loadUsers();
  await loadCandidates();
});
