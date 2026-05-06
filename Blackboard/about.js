const teamMembers = [
  {
    name: "Marc Andrew Q. Fernandez",
    role: "Project Leader / Head Developer",
    email: "marcandrewfernandez@gmail.com",
    motto: "Focus and Hardwork leads into success.",
    bio: "I came up with project Blackboard a couple months back, simply as an all-rounder sales software, it feel gret to finally materialize it.",
    contribution: ["Project planning", "Task management", "Coding", "Final checking"],
    funFact: "I started coding and stock trading since I was in Sixth Grade."
  },
  {
    name: "Andrei Abrera Pasana",
    role: "Frontend Designer",
    email: "andreipasana1098@gmail.com",
    motto: "Code. Solve. Improve.",
    bio: "I'll try my best even if I'm at my lowest.",
    contribution: ["Page layout", "Visual design", "Responsive styling"],
    funFact: "I would say that I am skilled in Time management and communications."
  },
  {
    name: "M.S Cedrick F. Soriano",
    role: "Layout Artist",
    email: "cedsoriano1133@gmail.com",
    motto: "Turn Your 'me' into our 'we'.",
    bio: "handles the layout and appearance of the website",
    contribution: ["Layout", "Website Design", "Appearances"],
    funFact: "Enjoys comparing computer parts and accessories."
  },
  {
    name: "Alexander A. Bautista",
    role: "HTML Developer",
    email: "megumialex00@gmail.com",
    motto: "Work and Improve.",
    bio: "works on the HTML end of the website, ensuring everything works well on the front end.",
    contribution: ["Front end maintenance", "Website Appearance", "Index"],
    funFact: "Likes making forms easier to understand."
  },
  {
    name: "Joerrenz A. Diola",
    role: "Admin Features Developer",
    email: "joerrenz.diola@gmail.com",
    motto: "Builds tools that help the admin manage the shop.",
    bio: "Chasing goals, not likes.",
    contribution: ["Admin panel", "Discount codes", "Customer management"],
    funFact: "Enjoys turning complicated tasks into buttons."
  },
  {
    name: "Enzo, Gabriel S. Jugo",
    role: "CSS Coder",
    email: "enzojugo00@gmail.com",
    motto: "There is nothing to look back on when you have nothing to regret.",
    bio: "Teamwork and Adaptability",
    contribution: ["General Layout", "Website Design", "Front End designer"],
    funFact: "Simplicity is Best."
  },
  {
    name: "John Harvy S. Ramos",
    role: "Content Writer",
    email: "ramosharvy2021@gmail.com",
    motto: "The more you know, the more you realize how little you know.",
    bio: "Patience and Adaptability",
    contribution: ["Website text", "Product descriptions", "Support content"],
    funFact: "Likes making short explanations sound natural."
  },

];

const aboutTabButtons = document.getElementById("aboutTabButtons");
const aboutProfileCard = document.getElementById("aboutProfileCard");
const pageLoader = document.getElementById("pageLoader");
let selectedMemberIndex = 0;

function hideAboutLoader() {
  if (!pageLoader) return;
  setTimeout(() => pageLoader.classList.add("hidden"), 350);
}

function renderTabs() {
  aboutTabButtons.innerHTML = "";

  teamMembers.forEach((member, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `about-tab-btn ${index === selectedMemberIndex ? "active" : ""}`;
    button.textContent = member.name;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", index === selectedMemberIndex ? "true" : "false");
    button.addEventListener("click", () => selectMember(index));
    aboutTabButtons.appendChild(button);
  });
}

function renderMemberProfile() {
  const member = teamMembers[selectedMemberIndex];
  const initials = member.name
    .split(" ")
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  aboutProfileCard.innerHTML = `
    <div class="about-profile-left">
      <div class="about-avatar">${initials}</div>
      <h2>${member.name}</h2>
      <p class="about-role">${member.role}</p>
      <p class="about-email">${member.email}</p>
    </div>

    <div class="about-profile-right">
      <p class="about-motto">“${member.motto}”</p>
      <p>${member.bio}</p>

      <h3>Main Contributions</h3>
      <ul class="about-contribution-list">
        ${member.contribution.map(item => `<li>${item}</li>`).join("")}
      </ul>

      <div class="about-fun-fact">
        <strong>Fun Fact:</strong> ${member.funFact}
      </div>
    </div>
  `;
}

function selectMember(index) {
  selectedMemberIndex = index;
  renderTabs();
  renderMemberProfile();
}

renderTabs();
renderMemberProfile();
hideAboutLoader();
