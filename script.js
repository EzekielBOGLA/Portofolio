document.addEventListener('DOMContentLoaded', function(){
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  // Mobile menu toggle (responsive fallback)
  if(menuToggle && mainNav){
    menuToggle.addEventListener('click', function(){
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('show');
    });
    mainNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if(window.innerWidth <= 980){ mainNav.classList.remove('show'); menuToggle.setAttribute('aria-expanded','false'); }
      });
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(!href || href === '#') return;
      e.preventDefault();
      const id = href.slice(1);
      const el = document.getElementById(id);
      if(el){
        el.scrollIntoView({behavior:'smooth',block:'center'});
        el.focus({preventScroll:true});
      }
      if(mainNav && mainNav.classList.contains('show')){ mainNav.classList.remove('show'); if(menuToggle) menuToggle.setAttribute('aria-expanded','false'); }
    });
  });

  // Lazy load images
  const lazyImages = Array.from(document.querySelectorAll('img.lazy'));
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          if(img.dataset.src){ img.src = img.dataset.src; img.removeAttribute('data-src'); }
          img.classList.remove('lazy');
          obs.unobserve(img);
        }
      });
    }, {rootMargin:'300px 0px'});
    lazyImages.forEach(img => io.observe(img));
  } else {
    lazyImages.forEach(img => { if(img.dataset.src) img.src = img.dataset.src; img.classList.remove('lazy'); });
  }

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal, .reveal-card');
  if('IntersectionObserver' in window){
    const ro = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    revealEls.forEach(el => ro.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('show'));
  }

  // Back to top and header shadow
  const toTop = document.getElementById('toTop');
  window.addEventListener('scroll', function(){
    header.classList.toggle('scrolled', window.scrollY > 20);
    if(toTop) toTop.classList.toggle('show', window.scrollY > 300);
    updateActiveNav();
  });
  if(toTop) toTop.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });

  // Active nav update
  function updateActiveNav(){
    const fromTop = window.scrollY + (window.innerHeight * 0.25);
    let current = sections.find(s => s.offsetTop <= fromTop && (s.offsetTop + s.offsetHeight) > fromTop);
    navLinks.forEach(a => a.classList.toggle('active', current && a.getAttribute('href') === '#' + current.id));
  }
  updateActiveNav();

  // Subtle 3D tilt for images (non-intrusive)
  const tiltParents = document.querySelectorAll('.photo-tilt, .project-media');
  tiltParents.forEach(parent => {
    parent.addEventListener('pointermove', function(e){
      const el = parent.querySelector('img') || parent;
      const rect = parent.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * 6;
      const ry = (px - 0.5) * -10;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
    });
    parent.addEventListener('pointerleave', function(){ const el = parent.querySelector('img') || parent; el.style.transform = ''; });
  });

  // Ripple effect for buttons
  const buttons = document.querySelectorAll('[data-ripple]');
  buttons.forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.6;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      ripple.className = 'ripple';
      this.appendChild(ripple);
      setTimeout(()=> ripple.remove(), 650);
    });
  });

  // Contact form: open mail client with prefilled content
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      if(!name || !email || !subject || !message){ formStatus.textContent = 'Veuillez remplir les champs obligatoires.'; return; }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRe.test(email)){ formStatus.textContent = 'Veuillez saisir une adresse email valide.'; return; }
      const company = document.getElementById('company').value.trim();
      const body = encodeURIComponent('Nom: ' + name + '\nSociété: ' + company + '\n\n' + message);
      const mailto = 'mailto:kdc-tg@outlook.fr?subject=' + encodeURIComponent(subject) + '&body=' + body;
      window.location.href = mailto;
      formStatus.textContent = 'Message envoyé. Merci.';
      contactForm.reset();
    });
  }

  // Accessibility: keyboard focus helper
  (function(){
    let usingKeyboard = false;
    window.addEventListener('keydown', (e) => { if(e.key === 'Tab') usingKeyboard = true; });
    window.addEventListener('mousedown', () => { usingKeyboard = false; });
    document.addEventListener('focusin', (e) => {
      if(usingKeyboard) e.target.classList.add('focus-visible');
    });
    document.addEventListener('focusout', (e) => { e.target.classList.remove('focus-visible'); });
  })();
});
