// Dummy users for testing
const users = [
  { username: "murid01", password: "1234", role: "murid" },
  { username: "guru01", password: "abcd", role: "guru" },
  { username: "parcom01", password: "parcom", role: "parcom" },
  { username: "panitia01", password: "admin", role: "panitia" }
];

// Ensure DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent form refresh

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("error");

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Redirect based on role
      switch (user.role) {
        case "murid":
          window.location.href = "vote.html";
          break;
        case "guru":
        case "parcom":
          window.location.href = "supervise.html";
          break;
        case "panitia":
          window.location.href = "livecount.html";
          break;
        default:
          errorMsg.textContent = "Unknown role.";
      }
    } else {
      errorMsg.textContent = "Invalid username or password!";
    }
  });
});
