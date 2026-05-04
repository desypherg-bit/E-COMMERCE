function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("blackboardUser"));
}

function isAdminUser() {
  const user = getLoggedInUser();
  return user && user.role === "admin";
}

function requireLogin() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const publicPages = ["login.html"];

  if (!publicPages.includes(currentPage) && !getLoggedInUser()) {
    const redirectPage = encodeURIComponent(currentPage);
    window.location.href = `login.html?redirect=${redirectPage}`;
  }
}

function getProfileKeyForUser(user) {
  return `blackboardProfile_${user ? user.username : "guest"}`;
}

function getSavedProfile(user) {
  if (!user) return {};
  return JSON.parse(localStorage.getItem(getProfileKeyForUser(user))) || {};
}

function setupUserBar() {
  const user = getLoggedInUser();
  const welcomeUser = document.getElementById("welcomeUser");
  const logoutBtn = document.getElementById("logoutBtn");

  if (welcomeUser && user) {
    const profile = getSavedProfile(user);
    const accountType = user.role === "admin" ? "Admin" : "Customer";
    welcomeUser.textContent = `Welcome, ${profile.fullName || user.name} (${accountType})`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("blackboardUser");
      window.location.href = "login.html";
    });
  }
}

requireLogin();
document.addEventListener("DOMContentLoaded", setupUserBar);
