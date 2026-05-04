const pageLoader = document.getElementById("pageLoader");

function hidePageLoader() {
  if (!pageLoader) return;
  setTimeout(() => pageLoader.classList.add("hidden"), 350);
}

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

const demoUsers = [
  {
    username: "admin",
    password: "admin123",
    name: "Admin",
    role: "admin"
  },
  {
    username: "customer",
    password: "customer123",
    name: "Customer",
    role: "customer"
  }
];

function getRedirectPage() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "index.html";
}

if (localStorage.getItem("blackboardUser")) {
  window.location.href = getRedirectPage();
}

loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = passwordInput.value.trim();

  const user = demoUsers.find(account => account.username === username && account.password === password);

  if (!user) {
    loginError.textContent = "Invalid username or password. Please try admin/admin123 or customer/customer123.";
    loginError.classList.remove("hidden");
    return;
  }

  const customerStatuses = JSON.parse(localStorage.getItem("blackboardCustomerStatuses")) || {};
  if (user.role !== "admin" && customerStatuses[user.username] === "Blocked") {
    loginError.textContent = "This customer account is currently blocked. Please contact support.";
    loginError.classList.remove("hidden");
    return;
  }

  localStorage.setItem("blackboardUser", JSON.stringify({
    username: user.username,
    name: user.name,
    role: user.role,
    loggedInAt: new Date().toISOString()
  }));

  window.location.href = getRedirectPage();
});

togglePassword.addEventListener("click", function() {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Hide" : "Show";
});


hidePageLoader();
