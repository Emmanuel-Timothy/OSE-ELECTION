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
