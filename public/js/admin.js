document.getElementById('addUserForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = {
    username: fd.get('username'),
    password: fd.get('password'),
    role: fd.get('role')
  };
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (localStorage.getItem('token') || '')
    },
    body: JSON.stringify(body)
  });
  const j = await res.json();
  document.getElementById('addUserResult').textContent = JSON.stringify(j);
});

document.getElementById('modUserForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = { id: Number(fd.get('id')) };
  if (fd.get('username')) body.username = fd.get('username');
  if (fd.get('password')) body.password = fd.get('password');
  if (fd.get('role')) body.role = fd.get('role');
  const res = await fetch('/api/admin', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (localStorage.getItem('token') || '')
    },
    body: JSON.stringify(body)
  });
  const j = await res.json();
  document.getElementById('modUserResult').textContent = JSON.stringify(j);
});

async function loadTables() {
  const token = localStorage.getItem('token') || '';
  
  // Load users
  try {
    const res = await fetch('/api/admin/users', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid data');
    
    document.getElementById('usersTable').innerHTML = `
      <table border="1">
        <tr><th>ID</th><th>Username</th><th>Role</th></tr>
        ${data.map(u => `
          <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.role}</td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (e) {
    document.getElementById('usersTable').textContent = 'Error loading users';
  }

  // Load candidates
  try {
    const res = await fetch('/api/livecount');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid data');
    
    document.getElementById('candidatesTable').innerHTML = `
      <table border="1">
        <tr><th>ID</th><th>Name</th><th>Votes</th></tr>
        ${data.map(c => `
          <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.votes}</td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (e) {
    document.getElementById('candidatesTable').textContent = 'Error loading candidates';
  }
}

loadTables();
// Refresh tables every 30 seconds
setInterval(loadTables, 30000);
