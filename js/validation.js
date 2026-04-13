/**
 * Form Validation Module for TwistCraft
 * Client-side validation with accessible error messaging
 */

import { announceToScreenReader } from './accessibility.js';

// Validation rules configuration
export const validationRules = {
  name: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    message: 'Please enter a valid name (letters only, minimum 2 characters)'
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    pattern: /^03\d{9}$/,
    message: 'Please enter a valid Pakistani phone number (03XXXXXXXXX)'
  },
  address: {
    required: true,
    minLength: 10,
    message: 'Please enter a complete address (minimum 10 characters)'
  },
  transactionId: {
    required: true,
    minLength: 8,
    pattern: /^[A-Z0-9]+$/,
    message: 'Please enter a valid transaction ID (letters and numbers only, minimum 8 characters)'
  },
  message: {
    required: false,
    minLength: 10,
    message: 'Message should be at least 10 characters'
  }
};

/**
 * Validate a single field
 * @param {string} fieldName - Name of the field
 * @param {string} value - Field value
 * @param {Object} rules - Validation rules for the field
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
export function validateField(fieldName, value, rules = validationRules[fieldName]) {
  if (!rules) {
    return { valid: true, message: '' };
  }
  
  const trimmedValue = typeof value === 'string' ? value.trim() : value;
  
  // Check required
  if (rules.required && !trimmedValue) {
    return {
      valid: false,
      message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
    };
  }
  
  // If not required and empty, it's valid
  if (!rules.required && !trimmedValue) {
    return { valid: true, message: '' };
  }
  
  // Check minimum length
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return {
      valid: false,
      message: rules.message || `Minimum ${rules.minLength} characters required`
    };
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return {
      valid: false,
      message: rules.message || 'Invalid format'
    };
  }
  
  return { valid: true, message: '' };
}

/**
 * Validate entire form
 * @param {Object} formData - Object containing form field values
 * @param {Object} ruleset - Validation rules (defaults to validationRules)
 * @returns {Object} Validation result {valid: boolean, errors: Object}
 */
export function validateForm(formData, ruleset = validationRules) {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, value] of Object.entries(formData)) {
    const rules = ruleset[fieldName];
    if (rules) {
      const result = validateField(fieldName, value, rules);
      if (!result.valid) {
        errors[fieldName] = result.message;
        isValid = false;
      }
    }
  }
  
  return { valid: isValid, errors };
}

/**
 * Display error message for a field
 * @param {HTMLElement} fieldElement - Input field element
 * @param {string} message - Error message
 */
export function showError(fieldElement, message) {
  if (!fieldElement) return;
  
  // Add error class to field
  fieldElement.classList.add('error');
  fieldElement.setAttribute('aria-invalid', 'true');
  
  // Find or create error message element
  let errorElement = fieldElement.parentElement.querySelector('.merr, .error-message');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'merr error-message';
    errorElement.setAttribute('role', 'alert');
    fieldElement.parentElement.appendChild(errorElement);
  }
  
  // Set error message
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Associate error with field
  const errorId = `error-${fieldElement.id || fieldElement.name}`;
  errorElement.id = errorId;
  fieldElement.setAttribute('aria-describedby', errorId);
  
  // Announce to screen readers
  announceToScreenReader(`Error: ${message}`, 'assertive');
}

/**
 * Clear error message for a field
 * @param {HTMLElement} fieldElement - Input field element
 */
export function clearError(fieldElement) {
  if (!fieldElement) return;
  
  // Remove error class
  fieldElement.classList.remove('error');
  fieldElement.removeAttribute('aria-invalid');
  fieldElement.removeAttribute('aria-describedby');
  
  // Hide error message
  const errorElement = fieldElement.parentElement.querySelector('.merr, .error-message');
  if (errorElement) {
    errorElement.style.display = 'none';
    errorElement.textContent = '';
  }
}

/**
 * Focus the first field with an error
 * @param {Object} errors - Errors object from validateForm
 * @param {HTMLElement} formElement - Form element containing the fields
 */
export function focusFirstError(errors, formElement) {
  const firstErrorField = Object.keys(errors)[0];
  if (firstErrorField && formElement) {
    const fieldElement = formElement.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
    if (fieldElement) {
      fieldElement.focus();
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

/**
 * Setup real-time validation for a form
 * @param {HTMLElement} formElement - Form element
 * @param {Object} ruleset - Validation rules
 */
export function setupRealtimeValidation(formElement, ruleset = validationRules) {
  if (!formElement) return;
  
  const inputs = formElement.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    
    // Validate on blur
    input.addEventListener('blur', () => {
      const rules = ruleset[fieldName];
      if (rules) {
        const result = validateField(fieldName, input.value, rules);
        if (!result.valid) {
          showError(input, result.message);
        } else {
          clearError(input);
        }
      }
    });
    
    // Clear error on input
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        const rules = ruleset[fieldName];
        if (rules) {
          const result = validateField(fieldName, input.value, rules);
          if (result.valid) {
            clearError(input);
          }
        }
      }
    });
  });
}

/**
 * Validate and show errors for all fields in a form
 * @param {HTMLElement} formElement - Form element
 * @param {Object} ruleset - Validation rules
 * @returns {boolean} True if form is valid
 */
export function validateAndShowErrors(formElement, ruleset = validationRules) {
  if (!formElement) return false;
  
  const formData = {};
  const inputs = formElement.querySelectorAll('input, textarea, select');
  
  // Collect form data
  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    formData[fieldName] = input.value;
  });
  
  // Validate
  const { valid, errors } = validateForm(formData, ruleset);
  
  // Show errors
  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    if (errors[fieldName]) {
      showError(input, errors[fieldName]);
    } else {
      clearError(input);
    }
  });
  
  // Focus first error
  if (!valid) {
    focusFirstError(errors, formElement);
  }
  
  return valid;
}

/**
 * Mark required fields with visual and ARIA indicators
 * @param {HTMLElement} formElement - Form element
 * @param {Object} ruleset - Validation rules
 */
export function markRequiredFields(formElement, ruleset = validationRules) {
  if (!formElement) return;
  
  const inputs = formElement.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    const rules = ruleset[fieldName];
    
    if (rules && rules.required) {
      input.setAttribute('required', '');
      input.setAttribute('aria-required', 'true');
      
      // Add visual indicator to label
      const label = formElement.querySelector(`label[for="${input.id}"]`);
      if (label && !label.querySelector('.required-indicator')) {
        const indicator = document.createElement('span');
        indicator.className = 'required-indicator';
        indicator.textContent = ' *';
        indicator.style.color = 'var(--pink)';
        indicator.setAttribute('aria-hidden', 'true');
        label.appendChild(indicator);
      }
    }
  });
}
