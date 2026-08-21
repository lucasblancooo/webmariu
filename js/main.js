/**
 * webmariu - Main JavaScript
 * Animaciones de entrada, WhatsApp float, formulario, smooth scroll
 */

(() => {
  'use strict';

  // ===== ELEMENTOS DEL DOM =====
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navOverlay = document.querySelector('.nav-overlay');
  const contactForm = document.getElementById('contactForm');
  const whatsappFloat = document.getElementById('whatsappFloat');

  // ===== HELPERS =====
  function closeMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu && navMenu.classList.contains('open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
      navToggle.focus();
    }
  }

  // ===== NAV MENU TOGGLE =====
  function initNavMenu() {
    console.log('initNavMenu elements', { navToggle: !!navToggle, navMenu: !!navMenu });
    if (!navToggle || !navMenu) return;

    function openMenu() {
      console.log('openMenu');
      navToggle.setAttribute('aria-expanded', 'true');
      navMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
      const firstLink = navMenu.querySelector('.nav-link');
      if (firstLink) firstLink.focus();
    }

    function closeMenu() {
      console.log('closeMenu');
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
      navToggle.focus();
    }

    function toggleMenu() {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      console.log('toggleMenu', { expanded });
      expanded ? closeMenu() : openMenu();
    }

    // Click en botón hamburguesa
    navToggle.addEventListener('click', (e) => {
      console.log('navToggle click', { currentTarget: e.currentTarget, target: e.target });
      toggleMenu();
    });

    // Click en overlay para cerrar - ahora delegado al navMenu
    navMenu.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-overlay')) {
        console.log('navOverlay click');
        closeMenu();
      }
    });

    // Click en enlaces del menú (mobile) - cerrar después de smooth scroll
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        console.log('navLink click', { href: link.getAttribute('href'), width: window.innerWidth });
        if (window.innerWidth < 768) {
          setTimeout(closeMobileMenu, 100);
        }
      });
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Cerrar al redimensionar a desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768 && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  // ===== ANIMACIONES DE ENTRADA (IntersectionObserver) =====
  function initRevealAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Si usuario prefiere menos movimiento, mostrar todo directamente
      document.querySelectorAll('.reveal').forEach(el => el.style.opacity = '1');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
    });

    // Inicialmente pausamos las animaciones
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.animationPlayState = 'paused';
      observer.observe(el);
    });
  }

  // ===== WHATSAPP FLOAT - Mostrar al hacer scroll =====
  function initWhatsAppFloat() {
    if (!whatsappFloat) return;

    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 300; // Aparece después de 300px

      if (shouldShow) whatsappFloat.classList.add('visible');
      else whatsappFloat.classList.remove('visible');

      lastScroll = scrollY;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });
  }

  // ===== FORMULARIO DE CONTACTO =====
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      const nombre = contactForm.nombre?.value.trim();
      const email = contactForm.email?.value.trim();
      const mensaje = contactForm.mensaje?.value.trim();

      if (!nombre || !email || !mensaje) {
        showFormMessage('Por favor completa todos los campos obligatorios', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showFormMessage('Por favor ingresa un email válido', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';

      try {
        await simulateApiCall();
        showFormMessage('¡Mensaje enviado! Te responderé pronto.', 'success');
        contactForm.reset();
      } catch (error) {
        showFormMessage('Hubo un error. Inténtalo de nuevo o escríbeme por WhatsApp.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function simulateApiCall() {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }

  function showFormMessage(message, type) {
    const existing = contactForm?.querySelector('.form-message');
    existing?.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message--${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      padding: 12px 16px;
      border-radius: 8px;
      margin-top: 16px;
      font-family: var(--font-ui);
      font-size: 0.95rem;
      animation: slideIn 0.3s ease;
      ${type === 'success'
        ? 'background: var(--teal-100); color: var(--teal-700); border: 1px solid var(--teal-300);'
        : 'background: #fef3f3; color: #b91c1c; border: 1px solid #fecaca;'
      }
    `;

    contactForm?.appendChild(messageEl);

    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transition = 'opacity 0.3s ease';
      setTimeout(() => messageEl.remove(), 300);
    }, 5000);
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        console.log('smooth scroll click', { targetId, href: this.href });
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        console.log('target found', { target: !!target, targetId });
        if (target) {
          const header = document.querySelector('.header');
          const headerOffset = header ? header.offsetHeight : 80;
          const elementPosition = target.getBoundingClientRect().top;
          console.log('elementPosition', elementPosition);

          // Si ya estamos cerca de la sección (menos de 50px), NO prevenir default
          // Esto permite que el navegador haga scroll nativo si ya estamos ahí
          if (Math.abs(elementPosition) < 50) {
            console.log('Already near section, using native scroll');
            if (window.innerWidth < 768) {
              closeMobileMenu();
            }
            return;
          }

          e.preventDefault();
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          console.log('scrolling to', offsetPosition);
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

          if (window.innerWidth < 768) {
            closeMobileMenu();
          }
        }
      });
    });
  }

  // ===== LAZY LOADING IMÁGENES =====
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
          img.classList.add('loaded');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '50px 0px', threshold: 0.01 });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));
  }

  // ===== HEADER SCROLL EFFECT =====
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    function updateHeader() {
      if (window.scrollY > 100) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }

    // Check on load (por si refrescás en otra sección)
    updateHeader();

    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // ===== INICIALIZACIÓN =====
  function init() {
    document.documentElement.classList.add('js-enabled');
    initNavMenu();
    initRevealAnimations();
    initWhatsAppFloat();
    initContactForm();
    initSmoothScroll();
    initLazyImages();
    initHeaderScroll();
    console.log('🎨 webmariu cargado correctamente');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();