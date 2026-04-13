/**
 * Payment Module for TwistCraft
 * Handles payment method selection and instructions
 */

import { copyToClipboard } from './utils.js';
import { announceToScreenReader } from './accessibility.js';

// Payment methods configuration
export const paymentMethods = {
  jazzcash: {
    name: 'JazzCash',
    accountNumber: '03289672939',
    accountTitle: 'TwistCraft',
    instructions: [
      'Open your JazzCash app or dial *786#',
      'Select "Send Money" or "Money Transfer"',
      'Enter the account number: 03289672939',
      'Enter the order amount shown above',
      'Complete the transaction',
      'Copy the transaction ID from the confirmation message',
      'Paste the transaction ID in the field below'
    ],
    icon: '💳',
    color: '#FF6B00'
  },
  easypaisa: {
    name: 'Easypaisa',
    accountNumber: '03289672939',
    accountTitle: 'TwistCraft',
    instructions: [
      'Open your Easypaisa app or dial *786#',
      'Select "Send Money" or "Money Transfer"',
      'Enter the account number: 03289672939',
      'Enter the order amount shown above',
      'Complete the transaction',
      'Copy the transaction ID from the confirmation SMS',
      'Paste the transaction ID in the field below'
    ],
    icon: '💰',
    color: '#00A859'
  }
};

let selectedPaymentMethod = null;

/**
 * Render payment method selection
 * @param {HTMLElement} container - Container element
 * @param {number} amount - Order amount
 */
export function renderPaymentMethods(container, amount) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="payment-methods">
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">Select Payment Method</h3>
      <div class="payment-options" role="radiogroup" aria-label="Payment methods">
        ${Object.entries(paymentMethods).map(([key, method]) => `
          <div class="payment-option" data-method="${key}">
            <input 
              type="radio" 
              id="payment-${key}" 
              name="payment-method" 
              value="${key}"
              aria-describedby="payment-${key}-desc"
            />
            <label for="payment-${key}">
              <span class="payment-icon" aria-hidden="true">${method.icon}</span>
              <span class="payment-name">${method.name}</span>
            </label>
            <div id="payment-${key}-desc" class="sr-only">
              ${method.name} mobile wallet payment
            </div>
          </div>
        `).join('')}
      </div>
      <div id="payment-instructions" class="payment-instructions" style="display: none;"></div>
    </div>
  `;
  
  // Add event listeners
  const radioButtons = container.querySelectorAll('input[name="payment-method"]');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectPaymentMethod(e.target.value, amount);
    });
  });
  
  // Add CSS for payment options
  addPaymentStyles();
}

/**
 * Select payment method and show instructions
 * @param {string} method - Payment method key
 * @param {number} amount - Order amount
 */
export function selectPaymentMethod(method, amount) {
  selectedPaymentMethod = method;
  const paymentData = paymentMethods[method];
  
  if (!paymentData) return;
  
  showPaymentInstructions(method, amount);
  announceToScreenReader(`${paymentData.name} selected. Payment instructions displayed.`, 'polite');
}

/**
 * Show payment instructions
 * @param {string} method - Payment method key
 * @param {number} amount - Order amount
 */
export function showPaymentInstructions(method, amount) {
  const instructionsContainer = document.getElementById('payment-instructions');
  if (!instructionsContainer) return;
  
  const paymentData = paymentMethods[method];
  if (!paymentData) return;
  
  instructionsContainer.style.display = 'block';
  instructionsContainer.innerHTML = `
    <div class="paybox" style="border-color: ${paymentData.color};">
      <h4 style="margin-bottom: 0.5rem; color: ${paymentData.color};">
        ${paymentData.icon} ${paymentData.name} Payment
      </h4>
      <p class="pamount">Rs. ${amount.toLocaleString('en-PK')}</p>
      <div class="panum">
        <strong>Account Number:</strong> ${paymentData.accountNumber}
        <button 
          class="copy-btn" 
          onclick="window.paymentModule.copyAccountNumber('${paymentData.accountNumber}')"
          aria-label="Copy account number"
        >
          📋 Copy
        </button>
      </div>
      <p style="font-size: 0.85rem; margin-top: 0.5rem;">
        <strong>Account Title:</strong> ${paymentData.accountTitle}
      </p>
      
      <div class="payment-steps" style="text-align: left; margin-top: 1rem;">
        <strong style="display: block; margin-bottom: 0.5rem;">Instructions:</strong>
        <ol style="padding-left: 1.5rem; font-size: 0.85rem; line-height: 1.6;">
          ${paymentData.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    </div>
    
    <div class="tid-note">
      ⚠️ Important: After completing the payment, enter your transaction ID below to confirm your order.
    </div>
  `;
}

/**
 * Copy account number to clipboard
 * @param {string} accountNumber - Account number to copy
 */
export async function copyAccountNumber(accountNumber) {
  const success = await copyToClipboard(accountNumber);
  
  if (success) {
    announceToScreenReader('Account number copied to clipboard', 'polite');
    showCopyConfirmation();
  } else {
    announceToScreenReader('Failed to copy account number', 'assertive');
    alert(`Account number: ${accountNumber}\nPlease copy manually.`);
  }
}

/**
 * Show copy confirmation
 */
function showCopyConfirmation() {
  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach(btn => {
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.style.background = 'var(--green)';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  });
}

/**
 * Validate transaction ID
 * @param {string} transactionId - Transaction ID to validate
 * @param {string} method - Payment method (optional)
 * @returns {Object} Validation result {valid: boolean, message: string}
 */
export function validateTransactionId(transactionId, method = selectedPaymentMethod) {
  if (!transactionId || !transactionId.trim()) {
    return {
      valid: false,
      message: 'Transaction ID is required'
    };
  }
  
  const trimmed = transactionId.trim().toUpperCase();
  
  // Minimum length check
  if (trimmed.length < 8) {
    return {
      valid: false,
      message: 'Transaction ID must be at least 8 characters'
    };
  }
  
  // Pattern check (alphanumeric)
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return {
      valid: false,
      message: 'Transaction ID should contain only letters and numbers'
    };
  }
  
  return {
    valid: true,
    message: ''
  };
}

/**
 * Get selected payment method
 * @returns {string|null} Selected payment method key
 */
export function getSelectedPaymentMethod() {
  return selectedPaymentMethod;
}

/**
 * Get payment method data
 * @param {string} method - Payment method key
 * @returns {Object|null} Payment method data
 */
export function getPaymentMethodData(method) {
  return paymentMethods[method] || null;
}

/**
 * Add payment styles
 */
function addPaymentStyles() {
  if (document.getElementById('payment-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'payment-styles';
  style.textContent = `
    .payment-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .payment-option {
      position: relative;
    }
    
    .payment-option input[type="radio"] {
      position: absolute;
      opacity: 0;
    }
    
    .payment-option label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }
    
    .payment-option input[type="radio"]:checked + label {
      border-color: var(--pink);
      background: linear-gradient(135deg, #fff0f6, #ffffff);
      box-shadow: 0 4px 12px rgba(255, 107, 157, 0.2);
    }
    
    .payment-option input[type="radio"]:focus + label {
      outline: 2px solid var(--pink);
      outline-offset: 2px;
    }
    
    .payment-option label:hover {
      border-color: var(--pink);
      transform: translateY(-2px);
    }
    
    .payment-icon {
      font-size: 2rem;
    }
    
    .payment-name {
      font-weight: 700;
      font-size: 1rem;
    }
    
    .payment-instructions {
      margin-top: 1.5rem;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .payment-steps ol {
      margin: 0;
    }
    
    .payment-steps li {
      margin-bottom: 0.5rem;
    }
    
    .sr-only {
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}

// Export payment module for global access
if (typeof window !== 'undefined') {
  window.paymentModule = {
    renderPaymentMethods,
    selectPaymentMethod,
    copyAccountNumber,
    validateTransactionId,
    getSelectedPaymentMethod,
    getPaymentMethodData
  };
}
