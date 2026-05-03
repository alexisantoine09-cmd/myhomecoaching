/* ============================================================
   CoachDomicile — script.js
   Toutes les fonctionnalités interactives du site
============================================================ */

'use strict';

/* ------------------------------------------------------------
   1. NAVBAR — scroll effect
------------------------------------------------------------ */
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

/* ------------------------------------------------------------
   2. MENU HAMBURGER
------------------------------------------------------------ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

function openMenu() {
  navLinks.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // empêche le scroll derrière
}

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  isOpen ? closeMenu() : openMenu();
});

// Fermer le menu quand on clique sur un lien
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Fermer avec Échap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ------------------------------------------------------------
   3. SMOOTH SCROLL
------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();

    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-height')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ------------------------------------------------------------
   4. BOUTON RETOUR EN HAUT
------------------------------------------------------------ */
const backToTop = document.getElementById('back-to-top');

function handleBackToTopVisibility() {
  backToTop.classList.toggle('visible', window.scrollY > 300);
}
window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ------------------------------------------------------------
   5. ANIMATIONS FADE-IN — Intersection Observer
------------------------------------------------------------ */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      // Décalage en cascade pour les grilles
      const siblings = entry.target.parentElement
        ? Array.from(entry.target.parentElement.querySelectorAll('.fade-in:not(.visible)'))
        : [];
      const delay = siblings.indexOf(entry.target) * 80;

      setTimeout(() => {
        entry.target.classList.add('visible');
      }, Math.min(delay, 400));

      fadeObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ------------------------------------------------------------
   6. TOGGLE CRÉDIT D'IMPÔT
   Met à jour tous les .price-amount et les notes de prix
------------------------------------------------------------ */
const taxToggle   = document.getElementById('tax-toggle');

// Données des prix : { full, tax } portées par chaque élément via data-attributes

function updatePrices(showTax) {
  // Montants principaux
  document.querySelectorAll('.price-amount[data-full]').forEach(el => {
    const full = parseFloat(el.dataset.full);
    const tax  = parseFloat(el.dataset.tax);
    const val  = showTax ? tax : full;
    // Formatage : supprimer les .0 inutiles
    el.textContent = Number.isInteger(val)
      ? `${val} €`
      : `${val.toFixed(2).replace('.', ',')} €`;
  });

  // Notes de prix (ligne "soit X € après crédit d'impôt")
  document.querySelectorAll('.price-tax-note').forEach(el => {
    el.style.display = showTax ? 'block' : 'none';
  });

  // Mise à jour des strong dans les notes de prix
  document.querySelectorAll('.price-tax-note strong[data-full]').forEach(el => {
    const full = parseFloat(el.dataset.full);
    const tax  = parseFloat(el.dataset.tax);
    const val  = showTax ? tax : full;
    el.textContent = Number.isInteger(val)
      ? `${val} €`
      : `${val.toFixed(2).replace('.', ',')} €`;
  });
}

taxToggle.addEventListener('change', () => {
  updatePrices(taxToggle.checked);
});

/* ------------------------------------------------------------
   7. FORMULAIRE DE CONTACT — validation + envoi via Formspree
   ============================================================
   CONFIGURATION REQUISE :
   Remplacez "YOUR_FORM_ID" ci-dessous par votre identifiant
   Formspree (récupéré sur https://formspree.io après création
   de votre formulaire). Exemple : 'https://formspree.io/f/xrgeoqng'
   ============================================================ */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqbqbeg';

const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const resetBtn    = document.getElementById('reset-form');

// Règles de validation
const validators = {
  prenom:   { required: true,  minLen: 2,  label: 'Prénom' },
  nom:      { required: true,  minLen: 2,  label: 'Nom' },
  email:    { required: true,  type: 'email', label: 'Email' },
  objectif: { required: true,  label: 'Objectif' },
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateField(name, value) {
  const rule = validators[name];
  if (!rule) return '';                               // pas de règle → ok

  if (rule.required && !value.trim()) {
    return `Le champ "${rule.label}" est obligatoire.`;
  }
  if (rule.minLen && value.trim().length < rule.minLen) {
    return `Veuillez entrer au moins ${rule.minLen} caractères.`;
  }
  if (rule.type === 'email' && value.trim() && !validateEmail(value.trim())) {
    return 'Adresse e-mail invalide.';
  }
  return '';
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);
  if (!field || !errorEl) return;

  if (message) {
    field.classList.add('error');
    errorEl.textContent = message;
  } else {
    field.classList.remove('error');
    errorEl.textContent = '';
  }
}

// Validation à la volée
['prenom', 'nom', 'email', 'objectif'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('blur', () => {
    showFieldError(id, validateField(id, el.value));
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) {
      showFieldError(id, validateField(id, el.value));
    }
  });
});

// Soumission du formulaire
contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  let isValid = true;

  // Valider chaque champ contrôlé
  Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    const msg = validateField(id, el ? el.value : '');
    showFieldError(id, msg);
    if (msg) isValid = false;
  });

  if (!isValid) {
    // Scroll vers la première erreur
    const firstError = contactForm.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Envoi réel via Formspree
  const submitBtn = contactForm.querySelector('.btn-submit');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnLoad   = submitBtn.querySelector('.btn-loading');

  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoad.style.display = 'inline';

  const formData = new FormData(contactForm);

  fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
    .then(response => {
      if (response.ok) {
        contactForm.style.display  = 'none';
        formSuccess.style.display  = 'block';
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        return response.json().then(data => {
          const msg = (data && data.errors && data.errors.length)
            ? data.errors.map(e => e.message).join('\n')
            : 'Une erreur est survenue lors de l\'envoi.';
          alert(msg + '\n\nVous pouvez aussi nous écrire directement à myalexispt@gmail.com');
        });
      }
    })
    .catch(() => {
      alert('Erreur réseau. Vérifiez votre connexion et réessayez, ou écrivez-nous directement à myalexispt@gmail.com');
    })
    .finally(() => {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoad.style.display = 'none';
    });
});

// Réinitialiser le formulaire
resetBtn.addEventListener('click', () => {
  contactForm.reset();
  contactForm.style.display = 'flex';
  formSuccess.style.display = 'none';
  // Nettoyer les erreurs
  contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  contactForm.querySelectorAll('.field-error').forEach(el => (el.textContent = ''));
});

/* ------------------------------------------------------------
   8. ANNÉE DYNAMIQUE DANS LE FOOTER
------------------------------------------------------------ */
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ------------------------------------------------------------
   9. BOUTONS PAYPAL — Abonnements mensuels
   ============================================================
   CONFIGURATION REQUISE :
   - Remplacez YOUR_CLIENT_ID dans la balise <script> PayPal
     dans index.html par votre vrai client-id PayPal Business
   - Remplacez PLAN_ID_STARTER, PLAN_ID_ESSENTIEL, PLAN_ID_INTENSIF
     ci-dessous par les IDs de plans créés dans votre dashboard
     PayPal : https://developer.paypal.com/dashboard/subscriptions
   ============================================================ */
const PAYPAL_PLANS = {
  'paypal-starter':   'PLAN_ID_STARTER',    // ← à remplacer
  'paypal-essentiel': 'PLAN_ID_ESSENTIEL',  // ← à remplacer
  'paypal-intensif':  'PLAN_ID_INTENSIF',   // ← à remplacer
};

function initPayPalButtons() {
  if (typeof paypal === 'undefined') {
    // SDK non chargé (mode sandbox désactivé ou client-id manquant) :
    // on affiche les boutons de secours (fallback)
    document.querySelectorAll('.paypal-btn-container').forEach(container => {
      container.style.display = 'none';
    });
    document.querySelectorAll('.paypal-fallback').forEach(el => {
      el.style.display = 'block';
    });
    return;
  }

  Object.entries(PAYPAL_PLANS).forEach(([containerId, planId]) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Masquer le bouton de secours
    const fallback = container.nextElementSibling;
    if (fallback && fallback.classList.contains('paypal-fallback')) {
      fallback.style.display = 'none';
    }

    paypal.Buttons({
      style: {
        shape:  'rect',
        color:  'gold',
        layout: 'horizontal',
        label:  'subscribe',
        tagline: false,
        height: 44,
      },
      createSubscription: function (data, actions) {
        return actions.subscription.create({ plan_id: planId });
      },
      onApprove: function (data) {
        alert(`Abonnement activé ! ID : ${data.subscriptionID}\nMerci pour votre confiance.`);
      },
      onError: function (err) {
        console.error('Erreur PayPal :', err);
        alert('Une erreur est survenue avec PayPal. Veuillez réessayer ou nous contacter directement.');
      },
    }).render(`#${containerId}`);
  });
}

// Attendre que le SDK PayPal soit chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Petit délai pour laisser le SDK s'initialiser
    setTimeout(initPayPalButtons, 800);
  });
} else {
  setTimeout(initPayPalButtons, 800);
}
