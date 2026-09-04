(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- NAV SCROLL STATE ---------- */
  var nav = document.getElementById('siteNav');
  function onScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); }
    else { nav.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu(){
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', function(){
    var open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true':'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });

  /* ---------- HERO ENTRANCE (single orchestrated sequence) ---------- */
  var heroEls = document.querySelectorAll('[data-hero-el]');
  if(!reduceMotion){
    heroEls.forEach(function(el, i){
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.9s cubic-bezier(.2,.7,.3,1), transform 0.9s cubic-bezier(.2,.7,.3,1)';
      setTimeout(function(){
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 160);
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  var revealTargets = document.querySelectorAll('.reveal, .intro-statement');
  if(reduceMotion){
    revealTargets.forEach(function(el){ el.classList.add('in'); });
  } else if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -8% 0px'});
    revealTargets.forEach(function(el){ io.observe(el); });
  } else {
    revealTargets.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- READ MORE (About) ---------- */
  var readMoreBtn = document.getElementById('readMoreBtn');
  var aboutMore = document.getElementById('aboutMore');
  if(readMoreBtn && aboutMore){
    readMoreBtn.addEventListener('click', function(){
      var open = aboutMore.classList.toggle('open');
      readMoreBtn.classList.toggle('open', open);
      readMoreBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      readMoreBtn.querySelector('.label').textContent = open ? 'Show less' : 'Read her full story';
    });
  }

  /* ---------- BOOK VIDEO PLAY/PAUSE ---------- */
  var bookVideo = document.getElementById('bookVideo');
  var videoPlayBtn = document.getElementById('videoPlayBtn');
  if(bookVideo && videoPlayBtn){
    videoPlayBtn.addEventListener('click', function(){
      if(bookVideo.paused){
        bookVideo.play();
      } else {
        bookVideo.pause();
      }
    });
    bookVideo.addEventListener('play', function(){ videoPlayBtn.classList.add('hidden'); });
    bookVideo.addEventListener('pause', function(){ videoPlayBtn.classList.remove('hidden'); });

    /* autoplay muted when scrolled into view, browser-safe */
    if('IntersectionObserver' in window){
      var vio = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            var p = bookVideo.play();
            if(p && p.catch){ p.catch(function(){ /* autoplay blocked, user can tap play */ }); }
          } else {
            bookVideo.pause();
          }
        });
      }, {threshold:0.5});
      vio.observe(bookVideo);
    }
  }

  /* ---------- GALLERY LIGHTBOX ---------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var currentIndex = 0;
  var lastFocused = null;

  function openLightbox(index){
    currentIndex = index;
    var item = galleryItems[index];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.getAttribute('data-caption') || '';
    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if(lastFocused){ lastFocused.focus(); }
  }
  function showRelative(delta){
    currentIndex = (currentIndex + delta + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentIndex];
    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.getAttribute('data-caption') || '';
  }

  galleryItems.forEach(function(item, index){
    item.setAttribute('tabindex','0');
    item.setAttribute('role','button');
    item.setAttribute('aria-label', 'View image: ' + (item.getAttribute('data-caption')||'gallery photo'));
    item.addEventListener('click', function(){ openLightbox(index); });
    item.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(index); }
    });
  });
  if(lightboxClose){ lightboxClose.addEventListener('click', closeLightbox); }
  if(lightboxPrev){ lightboxPrev.addEventListener('click', function(){ showRelative(-1); }); }
  if(lightboxNext){ lightboxNext.addEventListener('click', function(){ showRelative(1); }); }
  if(lightbox){
    lightbox.addEventListener('click', function(e){
      if(e.target === lightbox){ closeLightbox(); }
    });
  }
  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape'){ closeLightbox(); }
    if(e.key === 'ArrowLeft'){ showRelative(-1); }
    if(e.key === 'ArrowRight'){ showRelative(1); }
  });

  /* ---------- CONTACT FORM ----------
     NOTE TO SITE OWNER: no contact email or form backend was supplied with
     the brief, so this form is intentionally not wired to a live inbox yet.
     To make it fully functional, either:
       1) Set CONTACT_EMAIL below to a real address (uses a mailto: handoff), or
       2) Point CONTACT_FORM_ENDPOINT at a form backend (e.g. Formspree,
          a serverless function) and this will POST to it instead.
  ------------------------------------------------------------------ */
  var CONTACT_EMAIL = ''; // e.g. 'hello@yourdomain.com'
  var CONTACT_FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxx'

  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('cf-name').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var subject = document.getElementById('cf-subject').value.trim();
      var message = document.getElementById('cf-message').value.trim();

      if(!name || !email || !subject || !message){
        formStatus.textContent = 'Please fill in every field before sending.';
        return;
      }

      if(CONTACT_FORM_ENDPOINT){
        fetch(CONTACT_FORM_ENDPOINT, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({name:name, email:email, subject:subject, message:message})
        }).then(function(){
          formStatus.textContent = 'Thank you, ' + name.split(' ')[0] + ' — your message has been sent.';
          contactForm.reset();
        }).catch(function(){
          formStatus.textContent = 'Something went wrong sending your message. Please try WhatsApp or Instagram instead.';
        });
      } else if(CONTACT_EMAIL){
        var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
        window.location.href = 'mailto:' + CONTACT_EMAIL
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        formStatus.textContent = "Opening your email app to send this to Ololade's team...";
      } else {
        formStatus.textContent = 'Thanks, ' + name.split(' ')[0] + '. This form isn\'t connected to an inbox yet — please reach out via WhatsApp or Instagram below in the meantime.';
      }
    });
  }

  /* ---------- CLOSE MOBILE MENU ON ESC ---------- */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && mobileMenu.classList.contains('open')){ closeMenu(); }
  });

})();
