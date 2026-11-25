// ===== HEADER SCROLL SHRINK & MOBILE NAVIGATION =====
document.addEventListener('DOMContentLoaded', function () {
  const header = document.querySelector('header');
  const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
  const nav = document.getElementById('main-nav') || document.querySelector('nav');
  const navLinks = document.querySelectorAll('#main-nav a');
  const body = document.body;

  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function closeMenu() {
    if (!hamburger || !nav) return;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('active');
    body.classList.remove('menu-open');
  }

  if (hamburger && nav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('active');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      body.classList.toggle('menu-open', isOpen);
    });

    document.addEventListener('click', (e) => {
      if (nav.classList.contains('active') && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('active')) {
        closeMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Resolve FormSubmit _next redirect to an absolute URL
  ['form-next', 'order-form-next'].forEach((id) => {
    const input = document.getElementById(id);
    if (input && input.value && !input.value.startsWith('http')) {
      input.value = new URL(input.value, window.location.href).href;
    }
  });

  // Customize thanks page copy for Qchain order requests
  const params = new URLSearchParams(window.location.search);
  if (params.get('order') === 'qchain') {
    const thanksTitle = document.getElementById('thanks-title');
    const thanksCopy = document.getElementById('thanks-copy');
    if (thanksTitle) thanksTitle.textContent = 'Order Request Received!';
    if (thanksCopy) {
      thanksCopy.innerHTML = 'Thank you for your <strong>Qchain</strong> order request. Our team has received your details at <strong>revioq2026@gmail.com</strong> and will contact you within 24–48 hours to confirm pricing, shipping, and next steps.';
    }
  }

  // Qchain order modal & quantity stepper
  const orderModal = document.getElementById('order-modal');
  const openOrderBtn = document.getElementById('open-order-modal');
  const closeOrderBtn = document.getElementById('close-order-modal');
  const orderForm = document.getElementById('qchain-order-form');
  const qtyInput = document.getElementById('order-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const orderRefInput = document.getElementById('order-reference');

  if (orderModal && openOrderBtn) {
    let lastFocusedBeforeOrder = null;

    function openOrderModal() {
      lastFocusedBeforeOrder = document.activeElement;
      orderModal.hidden = false;
      orderModal.classList.add('is-open');
      body.classList.add('viewer-open');
      if (closeOrderBtn) closeOrderBtn.focus();
    }

    function closeOrderModal() {
      orderModal.classList.remove('is-open');
      orderModal.hidden = true;
      body.classList.remove('viewer-open');
      if (lastFocusedBeforeOrder instanceof HTMLElement) lastFocusedBeforeOrder.focus();
    }

    openOrderBtn.addEventListener('click', openOrderModal);
    if (closeOrderBtn) closeOrderBtn.addEventListener('click', closeOrderModal);

    orderModal.addEventListener('click', (e) => {
      if (e.target.matches('[data-order-close]')) closeOrderModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && orderModal.classList.contains('is-open')) {
        closeOrderModal();
      }
    });

    if (qtyInput && qtyMinus && qtyPlus) {
      function updateQty(delta) {
        const current = parseInt(qtyInput.value, 10) || 1;
        const next = Math.min(20, Math.max(1, current + delta));
        qtyInput.value = String(next);
        qtyMinus.disabled = next <= 1;
        qtyPlus.disabled = next >= 20;
      }
      updateQty(0);
      qtyMinus.addEventListener('click', () => updateQty(-1));
      qtyPlus.addEventListener('click', () => updateQty(1));
    }

    if (orderForm && orderRefInput) {
      orderForm.addEventListener('submit', () => {
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();
        orderRefInput.value = `RV-QC-${code}`;
      });
    }
  }

  // Active section indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  if (sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`#main-nav a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }
});

// ===== PORTFOLIO IMAGE VIEWER (LIGHTBOX) =====
document.addEventListener('DOMContentLoaded', function () {
  const images = Array.from(document.querySelectorAll('.asset-image'));
  if (!images.length) return;

  const viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Product image viewer');
  viewer.innerHTML = `
    <div class="image-viewer-backdrop" data-viewer-close></div>
    <div class="image-viewer-panel">
      <div class="image-viewer-toolbar">
        <p class="image-viewer-counter" aria-live="polite"></p>
        <button class="image-viewer-close" type="button" aria-label="Close image viewer">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
      <button class="image-viewer-control image-viewer-prev" type="button" aria-label="Previous image">
        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
      </button>
      <figure class="image-viewer-figure">
        <img class="image-viewer-image" alt="" />
        <figcaption class="image-viewer-caption"></figcaption>
      </figure>
      <button class="image-viewer-control image-viewer-next" type="button" aria-label="Next image">
        <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </button>
    </div>
  `;
  document.body.appendChild(viewer);

  const viewerImage = viewer.querySelector('.image-viewer-image');
  const caption = viewer.querySelector('.image-viewer-caption');
  const counter = viewer.querySelector('.image-viewer-counter');
  const closeButton = viewer.querySelector('.image-viewer-close');
  const previousButton = viewer.querySelector('.image-viewer-prev');
  const nextButton = viewer.querySelector('.image-viewer-next');
  let currentIndex = 0;
  let lastFocusedElement = null;

  images.forEach((image, index) => {
    image.setAttribute('tabindex', '0');
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `View larger image: ${image.alt}`);
    image.addEventListener('click', () => openViewer(index));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openViewer(index);
      }
    });
  });

  function getCaption(image) {
    const figureCaption = image.closest('figure')?.querySelector('figcaption')?.textContent.trim();
    return figureCaption || image.alt;
  }

  function renderImage() {
    const image = images[currentIndex];
    const isSingle = images.length < 2;
    viewer.classList.toggle('is-single', isSingle);
    viewerImage.src = image.currentSrc || image.src;
    viewerImage.alt = image.alt;
    caption.textContent = getCaption(image);
    counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(images.length).padStart(2, '0')}`;
    previousButton.hidden = isSingle;
    nextButton.hidden = isSingle;
    previousButton.disabled = isSingle;
    nextButton.disabled = isSingle;
  }

  function openViewer(index) {
    currentIndex = index;
    lastFocusedElement = document.activeElement;
    renderImage();
    viewer.classList.add('is-open');
    document.body.classList.add('viewer-open');
    closeButton.focus();
  }

  function closeViewer() {
    viewer.classList.remove('is-open');
    document.body.classList.remove('viewer-open');
    viewerImage.removeAttribute('src');
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function moveViewer(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    renderImage();
  }

  closeButton.addEventListener('click', closeViewer);
  previousButton.addEventListener('click', () => moveViewer(-1));
  nextButton.addEventListener('click', () => moveViewer(1));
  viewer.addEventListener('click', (event) => {
    if (event.target.matches('[data-viewer-close]')) closeViewer();
  });
  document.addEventListener('keydown', (event) => {
    if (!viewer.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft') moveViewer(-1);
    if (event.key === 'ArrowRight') moveViewer(1);
  });
});

// ===== FADE-IN ANIMATIONS =====
const fadeEls = document.querySelectorAll('.project, .about-grid, .links-grid, .contact-heading, .link-card, .service-row, .sitemap-grid a, .legal-sections section');
fadeEls.forEach(el => el.classList.add('fade-in'));
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
fadeEls.forEach(el => fadeObserver.observe(el));
