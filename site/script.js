/**
 * LUIGI COPERTINO - Landing Page Core Logic
 * Senior Engineer approach: Clean, secure, performance-first.
 */

// === CONFIGURATION ===
const CONFIG = {
  CALENDLY_URL: "https://calendly.com/unixgigi/15-minutes-meeting",
  N8N_WEBHOOK_URL: "https://lab.ai4u.it/webhook/luigi-contact",
  FEEDBACK_MESSAGES: {
    INITIALIZING: "> Initializing secure handshake...",
    SENDING: "> Executing data transfer to n8n node...",
    SUCCESS: "> SUCCESS: Message delivered. Standby for contact.",
    ERROR: "> ERROR: Network failure. Please use Calendly backup.",
    BOT_DETECTED: "> ERROR: Integrity check failed. Access denied."
  }
};

// === CALENDLY HANDLER ===
function openCalendly(e) {
  if (e) e.preventDefault();
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CONFIG.CALENDLY_URL });
  } else {
    // Fallback se il widget non carica
    window.open(CONFIG.CALENDLY_URL, '_blank');
  }
}

// Inizializza i trigger Calendly
document.querySelectorAll('[href="#calendar"], #bookCallTop, #bookCallBottom').forEach(btn => {
  btn.addEventListener('click', openCalendly);
});

// === CONTACT FORM HANDLER (Claude + n8n Style) ===
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = contactForm?.querySelector('button[type="submit"]');

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Pre-flight checks
    const formData = new FormData(contactForm);
    const honeypot = formData.get("website"); // campo 'website' nel tuo HTML
    const turnstileToken = formData.get("cf-turnstile-response");

    // Honeypot check (Silent fail per i bot)
    if (honeypot) {
      console.warn("Honeypot triggerato.");
      formStatus.textContent = CONFIG.FEEDBACK_MESSAGES.BOT_DETECTED;
      return;
    }

    // 2. UI State: Loading
    if (submitBtn) submitBtn.disabled = true;
    formStatus.style.opacity = "1";
    formStatus.style.color = "var(--accent-blue)";
    formStatus.textContent = CONFIG.FEEDBACK_MESSAGES.INITIALIZING;

    // 3. Prepare Payload
    const payload = {
      name: formData.get("name")?.trim(),
      email: formData.get("email")?.trim(),
      company: formData.get("company")?.trim(),
      message: formData.get("message")?.trim(),
      turnstile: turnstileToken, // Passiamo il token a n8n per eventuale verifica server-side
      metadata: {
        ts: new Date().toISOString(),
        url: window.location.href,
        lang: navigator.language
      }
    };

    try {
      // Un piccolo delay artificiale (400ms) per dare feedback visivo (UX Claude-style)
      await new Promise(resolve => setTimeout(resolve, 400));
      formStatus.textContent = CONFIG.FEEDBACK_MESSAGES.SENDING;

      const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Webhook rejected");

      // 4. Success State
      formStatus.style.color = "var(--accent-green)";
      formStatus.textContent = CONFIG.FEEDBACK_MESSAGES.SUCCESS;
      contactForm.reset();
      
      // Reset Turnstile widget se presente
      if (window.turnstile) window.turnstile.reset();

    } catch (error) {
      // 5. Error State
      console.error("Submission error:", error);
      formStatus.style.color = "var(--accent)";
      formStatus.textContent = CONFIG.FEEDBACK_MESSAGES.ERROR;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// === UTILS: Smooth Scroll for Anchors ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
