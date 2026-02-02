document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const WEBHOOK_URL = 'https://lab.ai4u.it/webhook/luigi-contact';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Honeypot check
    const hp = form.querySelector('[name="_hp"]').value;
    if (hp) return; 

    const btn = form.querySelector('button');
    const originalText = btn.textContent;
    
    // UI Loading State
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';
    status.style.color = 'inherit';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        form.reset();
        status.style.color = '#059669'; // Success Green
        status.textContent = 'Message sent! I will get back to you shortly.';
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      status.style.color = '#DC2626'; // Error Red
      status.textContent = 'Something went wrong. Please try again or book a call directly.';
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});
