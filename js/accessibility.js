/**
 * Accessibility Module for TwistCraft
 * Handles keyboard navigation, focus management, ARIA announcements, and skip links
 */

import { generateUniqueId } from './utils.js';

// Store for managing focus
let focusHistory = [];

/**
 * Initialize all accessibility features
 */
export function initAccessibility() {
  addSkipLink();
  enhanceFocusIndicators();
  setupAriaLiveRegions();
  setupEscapeKeyHandler();
  setupKeyboardNavigation();
  console.log('Accessibility features initialized');
}

/**
 * Add skip link to jump to main content
 */
function addSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to main content';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--pink);
    color: white;
    padding: 8px 16px;
    text-decoration: none;
    font-weight: 700;
    z-index: 10000;
    border-radius: 0 0 8px 0;
  `;
  
  // Show on focus
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '0';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Ensure main content has ID
  const mainContent = document.querySelector('#shop') || document.querySelector('section');
  if (mainContent && !mainContent.id) {
    mainContent.id = 'main';
  }
}

/**
 * Enhance focus indicators for better visibility
 */
function enhanceFocusIndicators() {
  // Add focus-visible polyfill behavior
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
  
  // Add CSS for enhanced focus indicators
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav *:focus {
      outline: 2px solid var(--pink) !important;
      outline-offset: 2px !important;
    }
    
    .keyboard-nav button:focus,
    .keyboard-nav a:focus,
    .keyboard-nav input:focus,
    .keyboard-nav select:focus,
    .keyboard-nav textarea:focus {
      box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.3) !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Setup ARIA live regions for announcements
 */
function setupAriaLiveRegions() {
  // Polite announcements (non-critical updates)
  if (!document.getElementById('aria-live-polite')) {
    const politeRegion = document.createElement('div');
    politeRegion.id = 'aria-live-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    politeRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(politeRegion);
  }
  
  // Assertive announcements (critical updates)
  if (!document.getElementById('aria-live-assertive')) {
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'aria-live-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(assertiveRegion);
  }
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
  const region = document.getElementById(regionId);
  
  if (region) {
    // Clear and set new message
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 3000);
  }
}

/**
 * Setup global Escape key handler for modals
 */
function setupEscapeKeyHandler() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close cart if open
      const cartSide = document.querySelector('.cart-side.open');
      if (cartSide) {
        const closeBtn = cartSide.querySelector('.xbtn');
        if (closeBtn) closeBtn.click();
      }
      
      // Close modal if open
      const modalBg = document.querySelector('.modal-bg.open');
      if (modalBg) {
        const closeBtn = modalBg.querySelector('.xbtn');
        if (closeBtn) closeBtn.click();
      }
    }
  });
}

/**
 * Setup keyboard navigation enhancements
 */
function setupKeyboardNavigation() {
  // Ensure all buttons respond to Enter and Space
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.getAttribute('role') === 'button') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.target.click();
      }
    }
  });
}

/**
 * Trap focus within a container (for modals/overlays)
 * @param {HTMLElement} container - Container element
 * @returns {Function} Cleanup function to remove trap
 */
export function trapFocus(container) {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  if (firstFocusable) {
    firstFocusable.focus();
  }
  
  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Store current focus before opening modal
 */
export function storeFocus() {
  focusHistory.push(document.activeElement);
}

/**
 * Restore focus after closing modal
 */
export function restoreFocus() {
  const previousFocus = focusHistory.pop();
  if (previousFocus && previousFocus.focus) {
    previousFocus.focus();
  }
}

/**
 * Handle modal opening with accessibility
 * @param {HTMLElement} modal - Modal element
 * @param {HTMLElement} trigger - Element that triggered the modal
 * @returns {Function} Cleanup function
 */
export function handleModalOpen(modal, trigger) {
  // Store focus
  if (trigger) {
    focusHistory.push(trigger);
  }
  
  // Set ARIA attributes
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  
  // Trap focus
  const releaseFocusTrap = trapFocus(modal);
  
  // Return cleanup function
  return () => {
    releaseFocusTrap();
    restoreFocus();
  };
}

/**
 * Add ARIA label to element if it doesn't have accessible text
 * @param {HTMLElement} element - Element to label
 * @param {string} label - Label text
 */
export function ensureAccessibleLabel(element, label) {
  if (!element.textContent.trim() && !element.getAttribute('aria-label')) {
    element.setAttribute('aria-label', label);
  }
}
