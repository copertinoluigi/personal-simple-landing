const CONFIG = {
  CALENDLY_URL: "https://calendly.com/unixgigi/15-minutes-meeting",
  N8N_WEBHOOK: "https://lab.ai4u.it/webhook/luigi-contact"
};

// Funzione di apertura sicura
function openCalendly(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Verifica se Calendly è caricato
  if (window.Calendly && typeof window.Calendly.initPopupWidget === "function") {
    window.Calendly.initPopupWidget({ 
        url: CONFIG.CALENDLY_URL 
    });
  } else {
    // Fallback estremo: se il popup fallisce, apri in una nuova finestra
    console.warn("Calendly popup non caricato, uso fallback redirect.");
    window.open(CONFIG.CALENDLY_URL, '_blank');
  }
}

// Inizializzazione al caricamento del DOM
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Aggancia l'evento a TUTTI i pulsanti che hanno l'ID o la classe corretta
    const calendlyTriggers = [
        document.getElementById("bookCallTop"),
        document.querySelector(".btn-nav.primary"),
        document.getElementById("bookCallBottom") // se lo aggiungi in futuro
    ];

    calendlyTriggers.forEach(btn => {
        if (btn) {
            // Rimuoviamo eventuali vecchi listener per evitare conflitti
            btn.removeEventListener("click", openCalendly);
            btn.addEventListener("click", openCalendly);
        }
    });

    // 2. Gestione Form (già funzionante, la manteniamo pulita)
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", handleFormSubmit);
    }
});

// Funzione separata per il form (n8n mapping)
async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button');
    const status = document.getElementById("formStatus");

    const payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        company: document.getElementById("company").value.trim(),
        message: document.getElementById("message").value.trim(),
        metadata: {
            source: "luigicopertino.it",
            ts: new Date().toISOString()
        }
    };

    submitBtn.disabled = true;
    status.textContent = "Sending...";

    try {
        const res = await fetch(CONFIG.N8N_WEBHOOK, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            status.textContent = "Success! I'll be in touch.";
            status.style.color = "#10b981";
            e.target.reset();
        } else { throw new Error(); }
    } catch (err) {
        status.textContent = "Error. Please try again or use Calendly.";
        status.style.color = "#ef4444";
    } finally {
        submitBtn.disabled = false;
    }
}
