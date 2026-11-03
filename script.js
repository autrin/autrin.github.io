// Initialize the website
document.addEventListener('DOMContentLoaded', function () {
  initializeWebsite();
});

function initializeWebsite() {
  setupEventListeners();
  setupSmoothScrolling();
  setupHeaderScroll();
  setFooterYear();
}

function setFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

function setupEventListeners() {
  // Contact form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  // Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      scrollToSection(targetId);
      updateActiveNavLink(link, navLinks);
    });
  });
}

function handleContactSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  if (!name || !email || !message) {
    showNotification('Please fill in all fields.', 'error');
    return;
  }

  showNotification('Sending message...', 'info');

  fetch(e.target.action, {
    method: 'POST',
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
    .then(response => {
      if (response.ok) {
        showNotification('Message sent. I\'ll get back to you soon.', 'success');
        e.target.reset();
      } else {
        showNotification('Failed to send message. Please try again.', 'error');
      }
    })
    .catch(() => {
      showNotification('Failed to send message. Please try again.', 'error');
    });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const bgColor =
    type === 'success' ? '#4ade80' :
      type === 'error' ? '#f87171' :
        '#60a5fa';

  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${bgColor};
    color: #0a0a0a;
    padding: 1rem 2rem;
    border-radius: 6px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    z-index: 3000;
    font-family: 'Share Tech Mono', monospace;
    font-weight: 600;
    transform: translateX(120%);
    transition: transform 0.3s ease;
  `;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4500);
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = section.offsetTop - headerHeight;
    window.scrollTo({
      top: targetPosition,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('companion-paused') ? 'auto' : 'smooth'
    });
  }
}

function updateActiveNavLink(activeLink, navLinks) {
  navLinks.forEach(link => link.classList.remove('active'));
  activeLink.classList.add('active');
}

function setupSmoothScrolling() {
  const navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

function setupHeaderScroll() {
  const header = document.querySelector('.header');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    lastScrollTop = scrollTop;
  });
}