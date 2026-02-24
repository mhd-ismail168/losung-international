import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// --- Handle back button and history ---
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was restored from bfcache (back button)
    document.body.style.opacity = '1';
    document.body.classList.add('page-loaded');
    ScrollTrigger.refresh();
  }
});

window.addEventListener('pagehide', (event) => {
  if (event.persisted) {
    // Page might be stored in bfcache
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

// --- Page Transitions ---
document.body.style.opacity = '1';
document.body.classList.add('page-loaded');

document.querySelectorAll('a').forEach(link => {
  if (link.hostname === window.location.hostname && !link.hash && link.getAttribute('href') !== '#') {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      gsap.to(document.body, {
        opacity: 0, duration: 0.5, onComplete: () => {
          window.location.href = href;
        }
      });
    });
  }
});

// --- CardNav Expansion Logic ---
const initCardNav = () => {
  const navContainer = document.querySelector('.card-nav-container');
  const navEl = document.getElementById('card-nav');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const contentEl = document.getElementById('card-nav-content');
  const cards = gsap.utils.toArray('.nav-card');

  if (!navEl || !hamburgerMenu || !contentEl || cards.length === 0) return;

  let isExpanded = false;
  let tl = null;
  const ease = 'power3.out';

  const calculateHeight = () => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      // Temporarily reveal to calculate true auto height
      const wasVisible = contentEl.style.visibility;
      const wasPointerEvents = contentEl.style.pointerEvents;
      const wasPosition = contentEl.style.position;
      const wasHeight = contentEl.style.height;

      contentEl.style.visibility = 'visible';
      contentEl.style.pointerEvents = 'auto';
      contentEl.style.position = 'static';
      contentEl.style.height = 'auto';

      // trigger reflow
      void contentEl.offsetHeight;

      const topBar = 60;
      const padding = 16;
      const contentHeight = contentEl.scrollHeight;

      // Restore
      contentEl.style.visibility = wasVisible;
      contentEl.style.pointerEvents = wasPointerEvents;
      contentEl.style.position = wasPosition;
      contentEl.style.height = wasHeight;

      return topBar + contentHeight + padding;
    }
    return 260; // Default desktop height
  };

  const createTimeline = () => {
    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cards, { y: 50, opacity: 0 });

    const newTl = gsap.timeline({ paused: true });

    newTl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    newTl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return newTl;
  };

  tl = createTimeline();

  const handleResize = () => {
    if (!tl) return;
    if (isExpanded) {
      const newHeight = calculateHeight();
      gsap.set(navEl, { height: newHeight });
      tl.kill();
      tl = createTimeline();
      tl.progress(1);
    } else {
      tl.kill();
      tl = createTimeline();
    }
  };

  window.addEventListener('resize', handleResize);

  hamburgerMenu.addEventListener('click', () => {
    if (!isExpanded) {
      hamburgerMenu.classList.add('open');
      navEl.classList.add('open');
      isExpanded = true;
      tl.play(0);
    } else {
      hamburgerMenu.classList.remove('open');
      tl.eventCallback('onReverseComplete', () => {
        navEl.classList.remove('open');
        isExpanded = false;
      });
      tl.reverse();
    }
  });

  // Sticky Navbar Logic: hide on scroll down, show on scroll up
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (isExpanded) return; // Don't hide if menu is open
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down & past threshold
      navContainer.classList.add('nav-hidden');
    } else {
      // Scrolling up or at top
      navContainer.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCardNav);
} else {
  initCardNav();
}

// --- Floating Orbs Animation (Hero) ---
const orbContainer = document.getElementById('hero-bg-anim');
if (orbContainer) {
  gsap.to('.orb-1', {
    x: 100,
    y: 50,
    duration: 10,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to('.orb-2', {
    x: -80,
    y: 80,
    duration: 12,
    delay: 1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to('.orb-3', {
    scale: 1.5,
    opacity: 0.3,
    duration: 8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
}

// --- Spotlight Effect ---
const glassCards = document.querySelectorAll('.glass-card');
glassCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// --- Founder Image CometCard 3D Animation ---
const founderWrapper = document.querySelector('.founder-image-wrapper-premium');
if (founderWrapper) {
  // Ensure the container allows 3D perspective
  founderWrapper.parentElement.style.perspective = '1200px';

  // Make sure wrapper behaves well for 3D
  gsap.set(founderWrapper, { transformStyle: "preserve-3d", transformOrigin: "center center" });

  // Add the glare overlay layer inside the wrapper
  const glare = document.createElement('div');
  glare.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 50;
    width: 100%;
    height: 100%;
    border-radius: 20px;
    pointer-events: none;
    mix-blend-mode: overlay;
    opacity: 0;
  `;
  founderWrapper.appendChild(glare);

  founderWrapper.addEventListener('mousemove', (e) => {
    const rect = founderWrapper.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert to percentages from center
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;

    const rotateDepth = 17.5;
    const translateDepth = 20;

    const rotateX = yPct * (rotateDepth * 2);
    const rotateY = xPct * (-rotateDepth * 2);
    const translateX = xPct * (translateDepth * 2);
    const translateY = yPct * (-translateDepth * 2);

    const glareX = (xPct + 0.5) * 100;
    const glareY = (yPct + 0.5) * 100;

    gsap.to(founderWrapper, {
      rotateX: rotateX,
      rotateY: rotateY,
      x: translateX,
      y: translateY,
      scale: 1.05,
      z: 50,
      boxShadow: "rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px",
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1200
    });

    gsap.to(glare, {
      background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)`,
      opacity: 0.6,
      duration: 0.2,
      ease: "none"
    });
  });

  founderWrapper.addEventListener('mouseleave', () => {
    gsap.to(founderWrapper, {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      scale: 1,
      z: 0,
      boxShadow: "rgba(0, 0, 0, 0) 0px 0px 0px 0px",
      duration: 0.8,
      ease: "power3.out",
      clearProps: "boxShadow"
    });

    gsap.to(glare, {
      opacity: 0,
      duration: 0.5
    });
  });
}

// --- Hero Content Animation (Home) ---
if (document.querySelector('.hero-content')) {
  const heroTimeline = gsap.timeline({ defaults: { duration: 1, ease: 'power3.out' } })
  heroTimeline
    .from('.brand-tag', { y: 20, opacity: 0, delay: 0.5 })
    .from('.hero-content h1', { y: 30, opacity: 0 }, '-=0.8')
    .from('.hero-content p', { y: 20, opacity: 0 }, '-=0.8')
    .from('.hero-cta', { y: 20, opacity: 0 }, '-=0.8')
    .from('.hero-trust-strip', { opacity: 0, y: 10 }, '-=0.6');
}

// --- Scroll Animations (Staggered Grids) ---




// --- Stats Counter Animation (Home Page Generic) ---
if (document.querySelector(".stats-grid")) {
  ScrollTrigger.create({
    trigger: ".stats-grid",
    start: "top 80%",
    once: true,
    onEnter: () => {
      gsap.utils.toArray(".stat-number").forEach((stat) => {
        const targetText = stat.innerText;
        if (!isNaN(parseInt(targetText))) {
          gsap.from(stat, {
            innerText: 0,
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            onUpdate: function () {
              stat.innerText = Math.ceil(this.targets()[0].innerText) + "+";
            }
          });
        } else {
          gsap.from(stat, {
            opacity: 0,
            y: 20,
            duration: 1,
            ease: "power2.out"
          });
        }
      });
    }
  });
}


// Fallback for individual elements not in grids


// --- Founder Section Specific Animation ---
if (document.querySelector('.founder-section')) {
  gsap.from('.founder-blob', {
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    ease: 'elastic.out(1, 0.5)',
    scrollTrigger: {
      trigger: '.founder-section',
      start: 'top 70%'
    }
  });

  gsap.from('.founder-img', {
    y: 50,
    opacity: 0,
    duration: 1,
    delay: 0.3,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.founder-section',
      start: 'top 70%'
    }
  });

  gsap.from('.founder-content > *', {
    y: 30,
    opacity: 0,
    duration: 1,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.founder-content',
      start: 'top 80%'
    }
  });
}

// --- Glassmorphism Hover Effect ---
const cards = document.querySelectorAll('.glass-card, .program-card, .destination-card, .uni-card, .uni-card-premium')

cards.forEach((card) => {
  card.addEventListener('mouseenter', () => {
    gsap.to(card, { y: -15, boxShadow: '0 25px 50px rgba(0,0,0,0.15)', duration: 0.4, ease: 'power2.out' })
  })
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { y: 0, boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)', duration: 0.4, ease: 'power2.out' })
  })
})

// --- FMIPH Redesign Animations (Intersection Observer) ---
// This logic handles the specific animations for the FMIPH page counters and fade-ins

// 1. Observer for Generic Visibility (Fade Up)
// 1. Observer for Generic Visibility (Fade Up)
const observerOptions = {
  threshold: 0.1, // Trigger earlier
  rootMargin: "0px 0px -50px 0px" // Trigger slightly before it hits the bottom
};

const visibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Use requestAnimationFrame for smoother class addition
      requestAnimationFrame(() => {
        entry.target.classList.add('visible');
      });
      visibilityObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-up, .fade-in-up').forEach(el => {
  visibilityObserver.observe(el);
});

// 2. Observer for Counters (Trigger when stats are in view)
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const counters = entry.target.querySelectorAll('.counter');
      counters.forEach(counter => {
        // Reset and Animate
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2s
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic-out

          const value = Math.floor(easeProgress * target);
          counter.innerText = value;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target; // Ensure final value
          }
        };
        requestAnimationFrame(updateCounter);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

// Observe containers that hold counters
document.querySelectorAll('.fmiph-hero-stats, .fmiph-about-stats, .stats-grid-premium').forEach(el => {
  counterObserver.observe(el);
});

// --- India Section Filtering Logic ---
document.addEventListener('DOMContentLoaded', () => {
  const indiaSection = document.getElementById('india-section');
  if (!indiaSection) return;

  const stateTabs = indiaSection.querySelectorAll('.filter-tab');
  const coursePills = indiaSection.querySelectorAll('.course-pill');
  const cityGroups = indiaSection.querySelectorAll('.city-group');

  let activeState = 'all';
  let activeCourse = 'all';

  function filterContent() {
    cityGroups.forEach(group => {
      const groupState = group.getAttribute('data-state');
      // Check if city group matches state
      const stateMatch = (activeState === 'all' || activeState === groupState);

      if (!stateMatch) {
        group.style.display = 'none';
        return;
      }

      // If state matches, we need to check cards inside
      const cards = group.querySelectorAll('.uni-card-tier1, .uni-card-tier2, .uni-card-compact, .uni-card-standard');
      let visibleCardsCount = 0;

      cards.forEach(card => {
        let cardCourses = [];
        try {
          cardCourses = JSON.parse(card.getAttribute('data-courses') || '[]');
        } catch (e) {
          console.error('Error parsing data-courses', e);
        }

        // Check if card matches course
        const courseMatch = (activeCourse === 'all' || cardCourses.includes(activeCourse));

        if (courseMatch) {
          card.style.display = ''; // Revert to CSS default (block/flex)
          visibleCardsCount++;

          // Smooth interaction animation
          gsap.fromTo(card,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: true }
          );
        } else {
          card.style.display = 'none';
        }
      });

      // Show/Hide Group based on visible cards with smooth height transition if possible
      // For now, simple display toggle to ensure layout correctness
      if (visibleCardsCount > 0) {
        group.style.display = 'block';
        gsap.to(group, { opacity: 1, duration: 0.3, overwrite: true });
      } else {
        group.style.display = 'none';
        gsap.set(group, { opacity: 0 });
      }
    });

    // Refresh ScrollTrigger to prevent jumps
    ScrollTrigger.refresh();
  }

  // Initial Filter Trigger
  filterContent();

  // Event Listeners for State
  stateTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Toggle active class
      stateTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeState = tab.getAttribute('data-filter');
      filterContent();
    });
  });

  // Event Listeners for Course
  coursePills.forEach(pill => {
    pill.addEventListener('click', () => {
      coursePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCourse = pill.getAttribute('data-filter');
      filterContent();
    });
  });
});

// --- Generic Fade-In Animation (Intersection Observer) ---


// --- Timeline Line Animation ---
const timelineLine = document.querySelector('.timeline-vertical-line');
if (timelineLine) {
  gsap.from(timelineLine, {
    height: 0,
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".timeline-vertical-container",
      start: "top 70%", // Start when container top hits 70% of viewport
      end: "bottom 70%",
      scrub: 1
    }
  });
}

// --- 3D Testimonial Carousel logic ---
const initCarousel = () => {
  const carouselItems = document.querySelectorAll('.testimonial-clean');
  const container = document.querySelector('.testimonial-carousel-container');

  if (carouselItems.length > 0) {
    let currentIndex = 0;
    const totalItems = carouselItems.length;

    function updateCarousel() {
      carouselItems.forEach((item, index) => {
        // Clear all positional classes
        item.classList.remove('active', 'prev', 'next', 'hidden-left', 'hidden-right');

        if (index === currentIndex) {
          item.classList.add('active');
        } else if (index === (currentIndex - 1 + totalItems) % totalItems) {
          item.classList.add('prev');
        } else if (index === (currentIndex + 1) % totalItems) {
          item.classList.add('next');
        } else if (index < currentIndex) {
          item.classList.add('hidden-left');
        } else {
          item.classList.add('hidden-right');
        }
      });
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalItems;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateCarousel();
    }

    carouselItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        if (item.classList.contains('next')) nextSlide();
        if (item.classList.contains('prev')) prevSlide();
      });
    });

    updateCarousel();
    let carouselInterval = setInterval(nextSlide, 2500);

    if (container) {
      container.addEventListener('mouseenter', () => clearInterval(carouselInterval));
      container.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(nextSlide, 2500);
      });

      const prevBtn = container.querySelector('.testi-prev');
      const nextBtn = container.querySelector('.testi-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prevSlide();
          clearInterval(carouselInterval);
          carouselInterval = setInterval(nextSlide, 2500);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          nextSlide();
          clearInterval(carouselInterval);
          carouselInterval = setInterval(nextSlide, 2500);
        });
      }
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCarousel);
} else {
  initCarousel();
}

// --- DecayCard / Destination Hover Logic ---
const initDecayCards = () => {
  const cards = document.querySelectorAll('.decay-card-wrapper');
  if (cards.length === 0) return;

  const lerp = (a, b, n) => (1 - n) * a + n * b;
  const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;
  const distance = (x1, x2, y1, y2) => Math.hypot(x1 - x2, y1 - y2);

  cards.forEach(card => {
    const svg = card.querySelector('svg.decay-svg');
    const displacementMap = card.querySelector('feDisplacementMap.displacement-map');

    if (!svg || !displacementMap) return;

    let isHovered = false;
    let cursor = { x: 0, y: 0 };
    let cachedCursor = { x: 0, y: 0 };
    let rect = card.getBoundingClientRect();

    const imgValues = {
      imgTransforms: { x: 0, y: 0, rz: 0 },
      displacementScale: 0
    };

    let animationFrameId;

    card.addEventListener('mouseenter', (ev) => {
      isHovered = true;
      rect = card.getBoundingClientRect();
      cursor = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      cachedCursor = { ...cursor };
      if (!animationFrameId) render();
    });

    card.addEventListener('mousemove', (ev) => {
      cursor = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
    });

    const render = () => {
      if (!isHovered) {
        // Return to default smoothly when not hovered
        imgValues.imgTransforms.x = lerp(imgValues.imgTransforms.x, 0, 0.05);
        imgValues.imgTransforms.y = lerp(imgValues.imgTransforms.y, 0, 0.05);
        imgValues.imgTransforms.rz = lerp(imgValues.imgTransforms.rz, 0, 0.05);
        imgValues.displacementScale = lerp(imgValues.displacementScale, 0, 0.05);

        gsap.set(svg, {
          x: imgValues.imgTransforms.x,
          y: imgValues.imgTransforms.y,
          rotationZ: imgValues.imgTransforms.rz
        });
        displacementMap.setAttribute('scale', imgValues.displacementScale);

        // Stop animation when practically at rest
        if (
          Math.abs(imgValues.imgTransforms.x) < 0.1 &&
          Math.abs(imgValues.imgTransforms.y) < 0.1 &&
          Math.abs(imgValues.displacementScale) < 0.1
        ) {
          gsap.set(svg, { x: 0, y: 0, rotationZ: 0 });
          displacementMap.setAttribute('scale', 0);
          animationFrameId = null;
          return; // Stop the loop
        }
      } else {
        // Active hover logic: Calculate target translation based on cursor position relative to card
        let targetX = lerp(imgValues.imgTransforms.x, map(cursor.x, 0, rect.width, -80, 80), 0.1);
        let targetY = lerp(imgValues.imgTransforms.y, map(cursor.y, 0, rect.height, -80, 80), 0.1);
        let targetRz = lerp(imgValues.imgTransforms.rz, map(cursor.x, 0, rect.width, -5, 5), 0.1);

        // Soft boundaries
        const bound = 50;
        if (targetX > bound) targetX = bound + (targetX - bound) * 0.2;
        if (targetX < -bound) targetX = -bound + (targetX + bound) * 0.2;
        if (targetY > bound) targetY = bound + (targetY - bound) * 0.2;
        if (targetY < -bound) targetY = -bound + (targetY + bound) * 0.2;

        imgValues.imgTransforms.x = targetX;
        imgValues.imgTransforms.y = targetY;
        imgValues.imgTransforms.rz = targetRz;

        gsap.set(svg, {
          x: imgValues.imgTransforms.x,
          y: imgValues.imgTransforms.y,
          rotationZ: imgValues.imgTransforms.rz
        });

        const cursorTravelledDistance = distance(cachedCursor.x, cursor.x, cachedCursor.y, cursor.y);
        imgValues.displacementScale = lerp(
          imgValues.displacementScale,
          map(cursorTravelledDistance, 0, 100, 0, 300), // Heightened sensitivity for card area
          0.1
        );

        displacementMap.setAttribute('scale', imgValues.displacementScale);
        cachedCursor = { ...cursor };
      }

      animationFrameId = requestAnimationFrame(render);
    };
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDecayCards);
} else {
  initDecayCards();
}

// --- Hero Typing Effect ---
const initHeroTyping = () => {
  const textElement = document.getElementById('hero-typing-text');
  const cursorElement = document.getElementById('hero-cursor');

  if (!textElement || !cursorElement) return;

  const texts = ["Medical journey abroad", "Global higher education", "Future in medicine"];
  const typingSpeed = 75;
  const deletingSpeed = 50;
  const pauseDuration = 1500;

  // Start with the first string fully rendered as hardcoded in HTML
  let textIndex = 0;
  let charIndex = texts[0].length;
  let isDeleting = true;
  let timeout;

  // Blinking cursor
  gsap.to(cursorElement, {
    opacity: 0,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });

  const type = () => {
    const currentText = texts[textIndex];

    if (isDeleting) {
      if (textElement.textContent === '') {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        charIndex = 0;
        timeout = setTimeout(type, 500); // small pause before typing next
        return;
      }
      charIndex--;
      textElement.textContent = currentText.substring(0, charIndex);
      timeout = setTimeout(type, deletingSpeed);
    } else {
      if (charIndex === currentText.length) {
        isDeleting = true;
        timeout = setTimeout(type, pauseDuration);
        return;
      }
      charIndex++;
      textElement.textContent = currentText.substring(0, charIndex);
      timeout = setTimeout(type, typingSpeed);
    }
  };

  // Start by pausing on the naturally loaded text, then delete
  setTimeout(type, pauseDuration);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHeroTyping);
} else {
  initHeroTyping();
}

// --- Inject Global Floating WhatsApp Button ---
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('.whatsapp-float')) {
    const waLink = document.createElement('a');
    waLink.href = 'https://wa.me/919497129612';
    waLink.className = 'whatsapp-float';
    waLink.target = '_blank';
    waLink.innerHTML = `
      <div class="whatsapp-float-inner">
        <svg class="whatsapp-text-ring" viewBox="0 0 100 100">
          <path id="textPath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="none" />
          <text>
            <textPath href="#textPath" startOffset="0">Chat now • Chat now • Chat now •</textPath>
          </text>
        </svg>
        <div class="whatsapp-float-icon-wrap">
          <img src="/images/whatsapp_icon.png" alt="WhatsApp">
        </div>
      </div>
    `;
    document.body.appendChild(waLink);
  }
});

// --- AJAX Formspree Submission ---
document.addEventListener('DOMContentLoaded', () => {
  const contactForms = document.querySelectorAll('.contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;

      const originalText = btn.innerText;
      btn.innerText = 'Sending...';
      btn.disabled = true;

      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: form.method,
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          form.reset(); // Clear the details boxes immediately
          btn.innerText = 'Message Sent!';
          setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
          }, 5000);
        } else {
          btn.innerText = 'Error! Try Again.';
          setTimeout(() => {
            btn.innerText = originalText;
            btn.disabled = false;
          }, 5000);
        }
      } catch (error) {
        btn.innerText = 'Error! Try Again.';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.disabled = false;
        }, 5000);
      }
    });
  });
});
