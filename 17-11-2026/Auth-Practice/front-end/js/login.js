const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberInput = document.getElementById("remember-me");
const message = document.getElementById("form-message");
const loginButton = document.getElementById("login-button");
const accountPanel = document.getElementById("account-panel");
const welcomeMessage = document.getElementById("welcome-message");
const forgotDialog = document.getElementById("forgot-dialog");

const registeredEmail = new URLSearchParams(window.location.search).get("email");
if (registeredEmail) emailInput.value = registeredEmail;

function showMessage(element, text, type = "") {
  element.textContent = text;
  element.className = `form-message ${type}`.trim();
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById("toggle-password").addEventListener("click", (event) => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  event.currentTarget.textContent = isPassword ? "Hide" : "Show";
  event.currentTarget.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage(message, "");

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!validEmail(email)) {
    showMessage(message, "Please enter a valid email address.", "error");
    emailInput.focus();
    return;
  }
  if (!password) {
    showMessage(message, "Please enter your password.", "error");
    passwordInput.focus();
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "PLEASE WAIT...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password, rememberMe: rememberInput.checked })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed.");

    showMessage(message, data.message, "success");
    welcomeMessage.textContent = `${data.user.name} (${data.user.email})`;
    loginForm.hidden = true;
    accountPanel.hidden = false;
  } catch (error) {
    showMessage(message, error.message || "Something went wrong. Please try again.", "error");
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "LOGIN";
  }
});

document.getElementById("forgot-link").addEventListener("click", () => {
  document.getElementById("reset-email").value = emailInput.value.trim();
  showMessage(document.getElementById("reset-message"), "");
  forgotDialog.showModal();
});

document.getElementById("forgot-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const resetEmail = document.getElementById("reset-email").value.trim().toLowerCase();
  const resetMessage = document.getElementById("reset-message");

  if (!validEmail(resetEmail)) {
    showMessage(resetMessage, "Please enter a valid email address.", "error");
    return;
  }

  const submit = document.getElementById("reset-submit");
  submit.disabled = true;
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed.");
    showMessage(resetMessage, data.message, "success");
  } catch (error) {
    showMessage(resetMessage, error.message, "error");
  } finally {
    submit.disabled = false;
  }
});

document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    accountPanel.hidden = true;
    loginForm.hidden = false;
    loginForm.reset();
    showMessage(message, "You have been logged out.", "success");
  }
});

// Restore the logged-in view after a page refresh when the auth cookie is valid.
(async function restoreSession() {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    if (!response.ok) return;
    const data = await response.json();
    welcomeMessage.textContent = `${data.user.name} (${data.user.email})`;
    loginForm.hidden = true;
    accountPanel.hidden = false;
  } catch {
    // The user can still log in normally if the API is unavailable.
  }
})();
