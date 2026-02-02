// === CONFIG ===
const CALENDLY_URL = "https://calendly.com/unixgigi/15-minutes-meeting"; 
const N8N_WEBHOOK_URL = "https://lab.ai4u.it/webhook/luigi-contact";

function openCalendly() {
  if (!window.Calendly) return;
  window.Calendly.initPopupWidget({ url: CALENDLY_URL });
}

document.getElementById("bookCallTop")?.addEventListener("click", openCalendly);
document.getElementById("bookCallBottom")?.addEventListener("click", openCalendly);

document.getElementById("contactForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    company: document.getElementById("company").value.trim(),
    message: document.getElementById("message").value.trim(),
    website: document.getElementById("website").value.trim(), // honeypot
    ts: Date.now(),
    page: window.location.href,
    ua: navigator.userAgent,
  };

  // Honeypot anti-bot
  if (payload.website) return;

  const status = document.getElementById("formStatus");
  status.textContent = "Sending...";

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Request failed");

    status.textContent = "Message sent. I'll get back to you soon.";
    e.target.reset();
  } catch (err) {
    status.textContent = "Something went wrong. Please book a call via Calendly.";
  }
});
