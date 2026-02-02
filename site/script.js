const CONFIG = {
  CALENDLY_URL: "https://calendly.com/unixgigi/15-minutes-meeting",
  N8N_WEBHOOK: "https://lab.ai4u.it/webhook/luigi-contact"
};

function openCalendly(e) {
  if (e) e.preventDefault();
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CONFIG.CALENDLY_URL });
  } else {
    window.open(CONFIG.CALENDLY_URL, '_blank');
  }
}

document.getElementById("bookCallTop").addEventListener("click", openCalendly);

const contactForm = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button');
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  if (data.website) return; // Honeypot

  submitBtn.disabled = true;
  status.textContent = "Sending message...";
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
      status.textContent = "Success! I'll get back to you shortly.";
      status.style.color = "#10b981";
      contactForm.reset();
    } else {
      throw new Error();
    }
  } catch (err) {
    status.textContent = "Error. Please try booking a call instead.";
    status.style.color = "#ef4444";
  } finally {
    submitBtn.disabled = false;
  }
});
