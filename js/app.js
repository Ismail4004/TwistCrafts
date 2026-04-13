/**
 * Main Application Entry Point for TwistCraft
 * Initializes all modules and sets up the application
 */

import { initAccessibility } from './accessibility.js';
import { initCart } from './cart.js';
import { initCheckout } from './checkout.js';
import { initAnalytics, trackEvent } from './analytics.js';

/**
 * Initialize the application
 */
function initApp() {
  console.log('Initializing TwistCraft...');
  
  // Initialize core modules
  initAccessibility();
  initCart();
  initCheckout();
  initAnalytics();
  
  // Update contact information
  updateContactInfo();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('TwistCraft initialized successfully!');
  trackEvent('app_initialized');
}

/**
 * Update contact information in the page
 */
function updateContactInfo() {
  // Update WhatsApp links
  const waLinks = document.querySelectorAll('a[href*="wa.me"]');
  waLinks.forEach(link => {
    link.href = 'https://wa.me/923289672939';
  });
  
  // Update email links
  const emailLinks = document.querySelectorAll('a[href^="mailto"]');
  emailLinks.forEach(link => {
    link.href = 'mailto:muhammadismail300212@gmail.com';
  });
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
  // Track product views
  document.addEventListener('click', (e) => {
    const productCard = e.target.closest('.pcard');
    if (productCard) {
      const productName = productCard.querySelector('.pname')?.textContent;
      if (productName) {
        trackEvent('product_view', { product: productName });
      }
    }
  });
  
  // Track filter usage
  const filterButtons = document.querySelectorAll('.fb');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('filter_used', { filter: btn.textContent });
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for debugging
if (typeof window !== 'undefined') {
  window.TwistCraft = {
    version: '1.0.0',
    initialized: true
  };
}
