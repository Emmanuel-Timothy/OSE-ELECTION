document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        switch (data.role) {
          case "murid": window.location.href = "vote.html"; break;
          case "guru":
          case "parcom": window.location.href = "supervise.html"; break;
          case "admin": window.location.href = "admin.html"; break;
          default: errorMsg.textContent = "Unknown role.";
        }
      } else {
        errorMsg.textContent = data.error || "Login failed.";
      }
    } catch (err) {
      console.error(err);
      errorMsg.textContent = "Server error. Try again.";
    }
  });
});
