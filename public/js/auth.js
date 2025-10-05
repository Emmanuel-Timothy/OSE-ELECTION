document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error");

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        switch (data.role) {
          case "murid":
            window.location.href = "vote.html"; break;
          case "guru":
          case "parcom":
            window.location.href = "supervise.html"; break;
          case "admin":
            window.location.href = "admin.html"; break;
          default:
            errorMsg.textContent = "Unknown role";
        }
      } else {
        errorMsg.textContent = data.error;
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Server error. Please try again later.";
    }
  });
});
