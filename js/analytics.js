/**
 * Analytics Module for TwistCraft
 * Track user interactions and errors for monitoring
 */

// Analytics state
const analyticsState = {
  enabled: true,
  events: []
};

/**
 * Initialize analytics
 */
export function initAnalytics() {
  // Check privacy consent
  if (!checkPrivacyConsent()) {
    analyticsState.enabled = false;
    return;
  }
  
  // Track page load
  trackEvent('page_load', {
    url: window.location.href,
    referrer: document.referrer
  });
  
  // Track performance
  trackPerformance();
  
  // Track errors
  window.addEventListener('error', (e) => {
    trackError(e.error, 'window_error');
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    trackError(e.reason, 'unhandled_promise');
  });
  
  console.log('Analytics initialized');
}

/**
 * Track event
 * @param {string} eventName - Event name
 * @param {Object} eventData - Event data
 */
export function trackEvent(eventName, eventData = {}) {
  if (!analyticsState.enabled) return;
  
  const event = {
    name: eventName,
    data: eventData,
    timestamp: new Date().toISOString()
  };
  
  analyticsState.events.push(event);
  console.log('Analytics Event:', event);
  
  // In production, send to analytics service
  // sendToAnalyticsService(event);
}

/**
 * Track error
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
export function trackError(error, context) {
  const errorData = {
    message: error?.message || String(error),
    stack: error?.stack,
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  trackEvent('error', errorData);
  console.error('Tracked Error:', errorData);
}

/**
 * Track page performance
 */
export function trackPerformance() {
  if (!window.performance) return;
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      if (perfData) {
        trackEvent('performance', {
          loadTime: perfData.loadEventEnd - perfData.fetchStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime
        });
      }
    }, 0);
  });
}

/**
 * Check privacy consent
 * @returns {boolean} Consent status
 */
export function checkPrivacyConsent() {
  // Check for Do Not Track
  if (navigator.doNotTrack === '1') {
    return false;
  }
  
  // Check localStorage for consent
  const consent = localStorage.getItem('analytics_consent');
  return consent !== 'false';
}

/**
 * Set privacy consent
 * @param {boolean} consent - Consent status
 */
export function setPrivacyConsent(consent) {
  localStorage.setItem('analytics_consent', consent ? 'true' : 'false');
  analyticsState.enabled = consent;
}

// Export for global access
if (typeof window !== 'undefined') {
  window.analyticsModule = {
    trackEvent,
    trackError,
    checkPrivacyConsent,
    setPrivacyConsent
  };
}
