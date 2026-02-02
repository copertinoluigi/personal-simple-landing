/**
 * LUIGI COPERTINO - Landing Page Logic v2.0
 * Optimized for n8n Webhook Mapping & UX
 */

const CONFIG = {
  CALENDLY_URL: "https://calendly.com/unixgigi/15-minutes-meeting",
  N8N_WEBHOOK: "https://lab.ai4u.it/webhook/luigi-contact"
};

// 1. GESTIONE CALENDLY
// Funzione unificata per aprire il popup di Calendly
function openCalendly(e) {
  if (e) e.preventDefault();
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CONFIG.CALENDLY_URL });
  } else {
    // Fallback se lo script esterno non è caricato
    window.open(CONFIG.CALENDLY_URL, '_blank');
  }
}

// Collega tutti i pulsanti "Book Call"
document.querySelectorAll('#bookCallTop, .btn-nav.primary').forEach(btn => {
  btn.addEventListener('click', openCalendly);
});


// 2. GESTIONE FORM CONTATTI
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    
    // --- MAPPATURA DATI ---
    // Estraiamo i valori esattamente come li vogliamo ricevere su n8n
    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      company: document.getElementById("company").value.trim(),
      message: document.getElementById("message").value.trim(),
      // Honeypot anti-bot
      website_trap: document.getElementById("website").value,
      // Metadata utili per un Analytics Consultant
      metadata: {
        source_url: window.location.href,
        submitted_at: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),
        browser_lang: navigator.language,
        screen_res: `${window.screen.width}x${window.screen.height}`
      }
    };

    // --- PROTEZIONE BOT (Honeypot) ---
    if (payload.website_trap) {
      console.warn("Bot detected via honeypot.");
      return; // Interrompiamo silenziosamente
    }

    // --- UI LOADING STATE ---
    submitBtn.disabled = true;
    submitBtn.innerText = "Sending...";
    formStatus.textContent = "Connecting to server...";
    formStatus.style.color = "var(--text-light)";

    try {
      // Invio dei dati a n8n
      const response = await fetch(CONFIG.N8N_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // --- SUCCESS ---
        formStatus.textContent = "Success! Message delivered. I'll be in touch.";
        formStatus.style.color = "#10b981"; // Verde successo
        contactForm.reset();
        
        // Reset del widget Cloudflare Turnstile (se presente)
        if (window.turnstile) window.turnstile.reset();
        
        // Riporta il bottone allo stato originale dopo 3 secondi
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerText = "Send Message";
        }, 3000);

      } else {
        throw new Error("Webhook Error");
      }

    } catch (error) {
      // --- ERROR / FAIL-SAFE ---
      console.error("Submission failed:", error);
      formStatus.innerHTML = `Error sending message. Please <a href="#" onclick="openCalendly()">book a call directly here</a>.`;
      formStatus.style.color = "#ef4444"; // Rosso errore
      submitBtn.disabled = false;
      submitBtn.innerText = "Try Again";
    }
  });
}

// 3. SMOOTH SCROLL PER I LINK INTERNI
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
