const CONFIG = {
  CALENDLY_URL: "https://calendly.com/unixgigi/15-minutes-meeting",
  N8N_WEBHOOK: "https://lab.ai4u.it/webhook/luigi-contact"
};

// Calendly
function openCalendly() {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CONFIG.CALENDLY_URL });
  } else {
    window.open(CONFIG.CALENDLY_URL, '_blank');
  }
}

document.getElementById("bookCallTop").addEventListener("click", openCalendly);

// Form Handling
const contactForm = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button');
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  // Bot check
  if (data.website) return;

  submitBtn.disabled = true;
  status.textContent = "Sending your message...";
  status.style.color = "var(--text)";

  try {
    const response = await fetch(CONFIG.N8N_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        source: "luigicopertino.it",
        timestamp: new Date().toISOString()
      }),
    });

    if (response.ok) {
      status.textContent = "Message sent! I'll be in touch soon.";
      status.style.color = "var(--accent)";
      contactForm.reset();
      if (window.turnstile) window.turnstile.reset();
    } else {
      throw new Error();
    }
  } catch (err) {
    status.textContent = "Error sending message. Please try Calendly.";
    status.style.color = "#ef4444";
  } finally {
    submitBtn.disabled = false;
  }
});
