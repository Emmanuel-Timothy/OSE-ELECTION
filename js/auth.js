// Dummy users for test (replace with users.sql later)
const users = [
  { username: "murid01", password: "1234", role: "murid" },
  { username: "guru01", password: "abcd", role: "guru" },
  { username: "parcom01", password: "parcom", role: "parcom" },
  { username: "panitia01", password: "admin", role: "panitia" }
];

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error");

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Redirect based on role
    if (user.role === "murid") {
      window.location.href = "public/vote.html";
    } else if (user.role === "guru" || user.role === "parcom") {
      window.location.href = "public/supervise.html";
    } else if (user.role === "panitia") {
      window.location.href = "public/livecount.html";
    }
  } else {
    errorMsg.textContent = "Invalid username or password!";
  }
});
