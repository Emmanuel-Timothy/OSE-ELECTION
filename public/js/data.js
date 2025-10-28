document.addEventListener('DOMContentLoaded', async () => {
  const auth = JSON.parse(localStorage.getItem("auth") || "null");

  if (!auth || auth.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // API utility function
  async function api(path, method = 'GET', body) {
    try {
      const headers = { 'Content-Type': 'application/json' };

      // Always send admin creds separately
      const payload = body
        ? { authUsername: auth.username, authPassword: auth.password, ...body }
        : { authUsername: auth.username, authPassword: auth.password };

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

  // Load all users
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
        const res = await api('/api/users', 'DELETE', { id: Number(btn.dataset.id) });
        if (!res.ok) alert(res.body.error || 'Failed to delete user');
        loadUsers();
      })
    );
  }

  // Load all candidates
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
        const res = await api('/api/candidates', 'DELETE', { id: Number(btn.dataset.id) });
        if (!res.ok) alert(res.body.error || 'Failed to delete candidate');
        loadCandidates();
      })
    );
  }

  // Create a new user
  const userForm = document.getElementById('createUserForm');
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const password = document.getElementById('newPassword').value.trim();
      const role = document.getElementById('newRole').value;
      if (!username || !password) return alert('Please fill in all fields.');

      // Send new user info separately
      const res = await api('/api/users', 'POST', { username, password, role });
      if (!res.ok) alert(res.body.error || 'Failed to create user');

      userForm.reset();
      loadUsers();
    });
  }

  // Create a new candidate
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

  await loadUsers();
  await loadCandidates();
});
