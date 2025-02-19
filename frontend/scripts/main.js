// main.js

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  }
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuButton = document.querySelector('button[onclick="toggleMobileMenu()"]');
    if (mobileMenu && menuButton && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
      mobileMenu.classList.add('hidden');
    }
  });
  
  // DOM Content Loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Header Scroll Effect (only if header exists)
    const header = document.getElementById('dynamic-header');
    if (header) {
      const headerLinks = header.getElementsByTagName('a');
      const headerLogo = header.querySelector('.text-2xl');
  
      window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      });
  
      // Apply Hover Effects to Header Elements
      function applyHoverEffect(element) {
        element.addEventListener('mousemove', function(e) {
          const rect = element.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          element.style.transform = `perspective(1000px) rotateX(${y * 10}deg) rotateY(${x * 10}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        element.addEventListener('mouseleave', function() {
          element.style.transform = 'none';
        });
      }
      if (headerLinks) {
        Array.from(headerLinks).forEach(link => {
          applyHoverEffect(link);
        });
      }
      if (headerLogo) {
        applyHoverEffect(headerLogo);
      }
    }
  
    // Apply Hover Effects to elements with class 'hover-scale'
    const hoverElements = document.querySelectorAll('.hover-scale');
    hoverElements.forEach(element => {
      element.addEventListener('mousemove', function(e) {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        element.style.transform = `perspective(1000px) rotateX(${y * 10}deg) rotateY(${x * 10}deg) scale3d(1.05, 1.05, 1.05)`;
      });
      element.addEventListener('mouseleave', function() {
        element.style.transform = 'none';
      });
    });
  });
  
  // Scroll Reveal Animations
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  document.addEventListener('scroll', function() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => {
      if (isElementInViewport(el)) {
        el.classList.add('opacity-100', 'translate-y-0');
        el.classList.remove('opacity-0', 'translate-y-10');
      }
    });
  });
  
  // Contact Form Submission Handling (if a contact form is present)
  const contactForm = document.querySelector('form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      try {
        const response = await fetch('http://localhost:3000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        alert(result.message || 'Thank you for your interest! We will contact you soon.');
        contactForm.reset();
      } catch (error) {
        console.error('Form submission error:', error);
        alert('Error submitting form. Please try again.');
      }
    });
  });
  
  // Initialize AOS if it's loaded
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }
  
  // Initialize Lucide Icons if available
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
  
  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  