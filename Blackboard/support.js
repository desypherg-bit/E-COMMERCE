const supportForm = document.getElementById("supportForm");

if (supportForm) {
  supportForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("supportName").value.trim();
    const email = document.getElementById("supportEmail").value.trim();
    const message = document.getElementById("supportMessage").value.trim();
    const supportStatus = document.getElementById("supportStatus");

    if (!name || !email || !message) {
      supportStatus.textContent = "Please complete all support fields before sending.";
      supportStatus.classList.remove("hidden", "support-success");
      supportStatus.classList.add("support-error");
      return;
    }

    const supportAddress = "support@theblackboard.com";
    const subject = encodeURIComponent(`Support Request from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\n` +
      `Email: ${email}\n\n` +
      `Message:\n${message}`
    );

    window.location.href = `mailto:${supportAddress}?subject=${subject}&body=${body}`;

    supportStatus.textContent = "Your email app should open with the support message ready to send.";
    supportStatus.classList.remove("hidden", "support-error");
    supportStatus.classList.add("support-success");
  });
}
