const pageLoader = document.getElementById("pageLoader");
const profileForm = document.getElementById("profileForm");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");
const profileMessage = document.getElementById("profileMessage");

function hidePageLoader() {
  if (!pageLoader) return;
  setTimeout(() => pageLoader.classList.add("hidden"), 350);
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("blackboardUser"));
}

function getProfileKey() {
  const user = getCurrentUser();
  return `blackboardProfile_${user ? user.username : "guest"}`;
}

function loadProfile() {
  return JSON.parse(localStorage.getItem(getProfileKey())) || {};
}

function showProfileMessage(message, type = "success") {
  profileMessage.textContent = message;
  profileMessage.classList.remove("hidden", "admin-success", "admin-error");
  profileMessage.classList.add(type === "error" ? "admin-error" : "admin-success");
}

function fillProfileForm() {
  const user = getCurrentUser();
  const profile = loadProfile();

  profileName.value = profile.fullName || (user ? user.name : "");
  profileEmail.value = profile.email || "";
  profilePhone.value = profile.phone || "";
  profileAddress.value = profile.address || "";
}

profileForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    showProfileMessage("Please log in again.", "error");
    return;
  }

  const profile = {
    fullName: profileName.value.trim(),
    email: profileEmail.value.trim(),
    phone: profilePhone.value.trim(),
    address: profileAddress.value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (!profile.fullName) {
    showProfileMessage("Please enter your full name.", "error");
    return;
  }

  localStorage.setItem(getProfileKey(), JSON.stringify(profile));
  localStorage.setItem("blackboardUser", JSON.stringify({ ...user, name: profile.fullName }));
  showProfileMessage("Profile saved successfully.");
});

fillProfileForm();
hidePageLoader();
