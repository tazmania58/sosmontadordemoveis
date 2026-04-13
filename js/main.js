/* ============================================
   SOS Montador de Móveis — Main JavaScript
   Premium interactions & animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  let lastScroll = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Init on load

  // --- Mobile Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll Animations (Intersection Observer) ---
  const animatedElements = document.querySelectorAll('[data-animate]');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  // --- Parallax Effect ---
  const parallaxElements = document.querySelectorAll('.parallax-bg');

  function handleParallax() {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.speed) || 0.3;
      const rect = el.parentElement.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (visible) {
        const yOffset = scrollY * speed;
        el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }
    });
  }

  if (parallaxElements.length > 0) {
    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax();
  }

  // --- Hero Slider ---
  const heroSlides = document.querySelectorAll('.hero__slide');
  let currentSlide = 0;

  if (heroSlides.length > 1) {
    function nextSlide() {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }
    setInterval(nextSlide, 5000);
  }

  // --- Counter Animation ---
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.counter);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const duration = 2000;
          const start = 0;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quart
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (target - start) * eased);
            el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  // --- Testimonials Carousel ---
  const track = document.querySelector('.testimonials-track');
  const prevBtn = document.querySelector('.testimonial-prev');
  const nextBtn = document.querySelector('.testimonial-next');

  if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    const cards = track.querySelectorAll('.testimonial-card');
    let cardsPerView = window.innerWidth > 768 ? 3 : 1;

    function getCardWidth() {
      if (cards.length === 0) return 0;
      return cards[0].offsetWidth + 16; // gap
    }

    function updateCarousel() {
      const cardWidth = getCardWidth();
      track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    nextBtn.addEventListener('click', () => {
      if (currentIndex < cards.length - cardsPerView) {
        currentIndex++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });

    window.addEventListener('resize', () => {
      cardsPerView = window.innerWidth > 768 ? 3 : 1;
      currentIndex = Math.min(currentIndex, Math.max(0, cards.length - cardsPerView));
      updateCarousel();
    });
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // --- Active nav link highlight ---
  const navLinks = document.querySelectorAll('.header__nav a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // --- Contact Form Handler ---
  const contactForm = document.querySelector('#contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const nome = this.querySelector('[name="nome"]').value;
      const telefone = this.querySelector('[name="telefone"]').value;
      const email = this.querySelector('[name="email"]').value;
      const servico = this.querySelector('[name="servico"]').value;
      const mensagem = this.querySelector('[name="mensagem"]').value;

      // Build WhatsApp message
      let whatsMsg = `Olá! Gostaria de solicitar um orçamento.\n\n`;
      whatsMsg += `*Nome:* ${nome}\n`;
      whatsMsg += `*Telefone:* ${telefone}\n`;
      if (email) whatsMsg += `*E-mail:* ${email}\n`;
      whatsMsg += `*Serviço:* ${servico}\n`;
      if (mensagem) whatsMsg += `*Mensagem:* ${mensagem}\n`;

      const whatsUrl = `https://wa.me/5521968669742?text=${encodeURIComponent(whatsMsg)}`;
      window.open(whatsUrl, '_blank');

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'form-success';
      successMsg.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>Mensagem enviada! Redirecionando para o WhatsApp...</span>
      `;
      successMsg.style.cssText = `
        display: flex; align-items: center; gap: 12px; padding: 16px 24px;
        background: #e8f5e9; color: #2e7d32; border-radius: 8px; margin-top: 16px;
        font-weight: 500; font-size: 0.9rem; animation: fadeIn 0.3s ease;
      `;
      contactForm.appendChild(successMsg);

      setTimeout(() => successMsg.remove(), 5000);
    });
  }

  // --- Phone mask ---
  const phoneInputs = document.querySelectorAll('input[name="telefone"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 6) {
        value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
      } else if (value.length > 2) {
        value = `(${value.slice(0,2)}) ${value.slice(2)}`;
      } else if (value.length > 0) {
        value = `(${value}`;
      }
      e.target.value = value;
    });
  });

  // --- Cursor Tool (desktop only) ---
  if (window.innerWidth > 1024) {
    // Wrench SVG — sobre o cursor
    const cursor = document.createElement('div');
    cursor.className = 'cursor-tool';
    cursor.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C8962E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>`;
    cursor.style.cssText = `
      position: fixed; top: 0; left: 0;
      pointer-events: none; z-index: 9999;
      transform: rotate(-45deg);
      transition: transform 0.15s ease, opacity 0.2s ease;
      opacity: 0;
      filter: drop-shadow(0 2px 4px rgba(200,150,46,0.4));
      will-change: left, top;
    `;
    document.body.appendChild(cursor);

    let visible = false;

    // Segue o mouse instantaneamente — sem lag
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      if (!visible) {
        cursor.style.opacity = '1';
        visible = true;
      }
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      visible = false;
    });

    // Gira ao passar em elementos interativos
    document.querySelectorAll('a, button, .btn, .service-card, .partner-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'rotate(135deg) scale(1.3)';
        cursor.querySelector('svg').style.stroke = '#D4A94A';
        cursor.style.filter = 'drop-shadow(0 3px 8px rgba(200,150,46,0.7))';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'rotate(-45deg) scale(1)';
        cursor.querySelector('svg').style.stroke = '#C8962E';
        cursor.style.filter = 'drop-shadow(0 2px 4px rgba(200,150,46,0.4))';
      });
    });
  }

});
