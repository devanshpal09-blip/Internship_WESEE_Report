const form = document.getElementById("registration-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const message = document.getElementById("form-message");
const registerButton = document.getElementById("register-button");

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`.trim();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  showMessage("");
  if (name.length < 2) {
    showMessage("Please enter your name.", "error");
    nameInput.focus();
    return;
  }
  if (!validEmail(email)) {
    showMessage("Please enter a valid email address.", "error");
    emailInput.focus();
    return;
  }
  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", "error");
    passwordInput.focus();
    return;
  }
  if (password !== confirmPasswordInput.value) {
    showMessage("Passwords do not match.", "error");
    confirmPasswordInput.focus();
    return;
  }

  registerButton.disabled = true;
  registerButton.textContent = "CREATING...";
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not create your account.");

    showMessage("Account created. Redirecting to login...", "success");
    window.setTimeout(() => {
      window.location.href = `/pages/login.html?email=${encodeURIComponent(email)}`;
    }, 900);
  } catch (error) {
    showMessage(error.message || "Something went wrong. Please try again.", "error");
    registerButton.disabled = false;
    registerButton.textContent = "CREATE ACCOUNT";
  }
});
