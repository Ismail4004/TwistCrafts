/**
 * Checkout Module for TwistCraft
 * Multi-step checkout flow with validation and state management
 */

import { getCartItems, getCartTotal, clearCart } from './cart.js';
import { validateAndShowErrors, validationRules } from './validation.js';
import { renderPaymentMethods, getSelectedPaymentMethod, validateTransactionId } from './payment.js';
import { saveOrder, prepareOrderData } from './database.js';
import { announceToScreenReader, handleModalOpen, storeFocus, restoreFocus } from './accessibility.js';
import { formatPrice } from './utils.js';

// Checkout state
const checkoutState = {
  currentStep: 1,
  totalSteps: 4,
  formData: {
    customerInfo: {},
    paymentMethod: null,
    transactionId: null
  },
  orderId: null,
  cleanupFocusTrap: null
};

/**
 * Initialize checkout modal
 */
export function initCheckout() {
  const checkoutBtn = document.querySelector('.chkbtn');
  const modalBg = document.querySelector('.modal-bg');
  const closeBtn = modalBg?.querySelector('.xbtn');
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', openCheckout);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeCheckout);
  }
  
  // Close on background click
  if (modalBg) {
    modalBg.addEventListener('click', (e) => {
      if (e.target === modalBg) {
        closeCheckout();
      }
    });
  }
}

/**
 * Open checkout modal
 */
export function openCheckout() {
  const items = getCartItems();
  
  if (items.length === 0) {
    announceToScreenReader('Your cart is empty. Please add items before checkout.', 'assertive');
    alert('Your cart is empty!');
    return;
  }
  
  const modalBg = document.querySelector('.modal-bg');
  const modal = modalBg?.querySelector('.modal');
  
  if (!modalBg || !modal) return;
  
  // Reset state
  checkoutState.currentStep = 1;
  checkoutState.formData = { customerInfo: {}, paymentMethod: null, transactionId: null };
  checkoutState.orderId = null;
  
  // Store focus and setup modal
  storeFocus();
  checkoutState.cleanupFocusTrap = handleModalOpen(modal, document.activeElement);
  
  // Show modal
  modalBg.classList.add('open');
  
  // Render first step
  renderStep(1);
  
  announceToScreenReader('Checkout opened. Step 1 of 4: Review your order', 'polite');
}

/**
 * Close checkout modal
 */
export function closeCheckout() {
  const modalBg = document.querySelector('.modal-bg');
  
  if (modalBg) {
    modalBg.classList.remove('open');
  }
  
  // Cleanup focus trap
  if (checkoutState.cleanupFocusTrap) {
    checkoutState.cleanupFocusTrap();
  }
  
  restoreFocus();
  announceToScreenReader('Checkout closed', 'polite');
}

/**
 * Render checkout step
 * @param {number} step - Step number (1-4)
 */
function renderStep(step) {
  checkoutState.currentStep = step;
  updateProgressBar(step);
  
  const mbody = document.querySelector('.mbody');
  if (!mbody) return;
  
  switch (step) {
    case 1:
      renderOrderReview(mbody);
      break;
    case 2:
      renderCustomerInfo(mbody);
      break;
    case 3:
      renderPayment(mbody);
      break;
    case 4:
      renderConfirmation(mbody);
      break;
  }
}

/**
 * Update progress bar
 * @param {number} currentStep - Current step number
 */
function updateProgressBar(currentStep) {
  const progressSteps = document.querySelectorAll('.pstep');
  
  progressSteps.forEach((step, index) => {
    step.classList.remove('active', 'done');
    
    if (index + 1 < currentStep) {
      step.classList.add('done');
    } else if (index + 1 === currentStep) {
      step.classList.add('active');
    }
  });
  
  announceToScreenReader(`Step ${currentStep} of ${checkoutState.totalSteps}`, 'polite');
}

/**
 * Render order review (Step 1)
 */
function renderOrderReview(container) {
  const items = getCartItems();
  const total = getCartTotal();
  
  container.innerHTML = `
    <div class="spanel show">
      <h3 style="margin-bottom: 1rem;">Review Your Order</h3>
      <div class="order-items">
        ${items.map(item => `
          <div class="orow">
            <span class="oemoji" aria-hidden="true">${item.emoji}</span>
            <span class="oname">${item.name}</span>
            <span class="oqty">×${item.quantity}</span>
            <span class="oprice">${formatPrice(item.price * item.quantity)}</span>
          </div>
        `).join('')}
      </div>
      <div class="ototal">
        <span>Total:</span>
        <span>${formatPrice(total)}</span>
      </div>
      <div class="mnav">
        <button class="mnext" onclick="window.checkoutModule.nextStep()">
          Continue to Customer Info →
        </button>
      </div>
    </div>
  `;
}

/**
 * Render customer information form (Step 2)
 */
function renderCustomerInfo(container) {
  container.innerHTML = `
    <div class="spanel show">
      <h3 style="margin-bottom: 1rem;">Customer Information</h3>
      <form id="customer-form">
        <div class="mfg">
          <label for="customer-name">Full Name *</label>
          <input type="text" id="customer-name" name="name" required aria-required="true" />
        </div>
        <div class="mfg">
          <label for="customer-email">Email Address *</label>
          <input type="email" id="customer-email" name="email" required aria-required="true" />
        </div>
        <div class="mfg">
          <label for="customer-phone">Phone Number *</label>
          <input type="tel" id="customer-phone" name="phone" placeholder="03XXXXXXXXX" required aria-required="true" />
        </div>
        <div class="mfg">
          <label for="customer-address">Delivery Address *</label>
          <textarea id="customer-address" name="address" rows="3" required aria-required="true"></textarea>
        </div>
      </form>
      <div class="mnav">
        <button class="mback" onclick="window.checkoutModule.previousStep()">
          ← Back
        </button>
        <button class="mnext" onclick="window.checkoutModule.nextStep()">
          Continue to Payment →
        </button>
      </div>
    </div>
  `;
}

/**
 * Render payment method selection (Step 3)
 */
function renderPayment(container) {
  const total = getCartTotal();
  
  container.innerHTML = `
    <div class="spanel show">
      <h3 style="margin-bottom: 1rem;">Payment Method</h3>
      <div id="payment-container"></div>
      <div class="mfg" style="margin-top: 1.5rem;">
        <label for="transaction-id">Transaction ID *</label>
        <input 
          type="text" 
          id="transaction-id" 
          name="transactionId" 
          placeholder="Enter your transaction ID"
          required 
          aria-required="true"
          style="text-transform: uppercase;"
        />
        <small style="color: var(--muted); font-size: 0.8rem; display: block; margin-top: 0.25rem;">
          Complete the payment first, then enter the transaction ID you received
        </small>
      </div>
      <div class="mnav">
        <button class="mback" onclick="window.checkoutModule.previousStep()">
          ← Back
        </button>
        <button class="mnext" onclick="window.checkoutModule.submitOrder()">
          Place Order →
        </button>
      </div>
    </div>
  `;
  
  // Render payment methods
  const paymentContainer = container.querySelector('#payment-container');
  renderPaymentMethods(paymentContainer, total);
}

/**
 * Render order confirmation (Step 4)
 */
function renderConfirmation(container) {
  const orderId = checkoutState.orderId;
  const total = getCartTotal();
  const whatsappMessage = encodeURIComponent(
    `Hi! I just placed an order.\nOrder ID: ${orderId}\nTotal: ${formatPrice(total)}\nPlease confirm.`
  );
  
  container.innerHTML = `
    <div class="spanel show">
      <div class="success-box">
        <div class="success-icon">✅</div>
        <h3>Order Placed Successfully!</h3>
        <div class="oid">${orderId}</div>
        <p>Thank you for your order! We've received your payment details.</p>
        <p>You will receive a confirmation email shortly.</p>
        <p style="margin-top: 1rem; font-size: 0.9rem;">
          <strong>Need help?</strong><br>
          Contact us via WhatsApp or email
        </p>
        <a 
          href="https://wa.me/923289672939?text=${whatsappMessage}" 
          target="_blank"
          class="wa-confirm"
        >
          💬 Confirm on WhatsApp
        </a>
        <button 
          class="mnext" 
          onclick="window.checkoutModule.closeCheckout()" 
          style="margin-top: 1rem; width: 100%;"
        >
          Close
        </button>
      </div>
    </div>
  `;
}

/**
 * Navigate to next step
 */
export async function nextStep() {
  if (!validateCurrentStep()) {
    return;
  }
  
  renderStep(checkoutState.currentStep + 1);
}

/**
 * Navigate to previous step
 */
export function previousStep() {
  if (checkoutState.currentStep > 1) {
    renderStep(checkoutState.currentStep - 1);
  }
}

/**
 * Validate current step
 * @returns {boolean} Validation result
 */
function validateCurrentStep() {
  const step = checkoutState.currentStep;
  
  if (step === 2) {
    // Validate customer info
    const form = document.getElementById('customer-form');
    if (!form) return false;
    
    const isValid = validateAndShowErrors(form, {
      name: validationRules.name,
      email: validationRules.email,
      phone: validationRules.phone,
      address: validationRules.address
    });
    
    if (isValid) {
      // Store customer info
      const formData = new FormData(form);
      checkoutState.formData.customerInfo = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address')
      };
    }
    
    return isValid;
  }
  
  return true;
}

/**
 * Submit order
 */
export async function submitOrder() {
  // Validate payment method
  const paymentMethod = getSelectedPaymentMethod();
  if (!paymentMethod) {
    announceToScreenReader('Please select a payment method', 'assertive');
    alert('Please select a payment method');
    return;
  }
  
  // Validate transaction ID
  const transactionIdInput = document.getElementById('transaction-id');
  const transactionId = transactionIdInput?.value;
  
  const validation = validateTransactionId(transactionId, paymentMethod);
  if (!validation.valid) {
    announceToScreenReader(validation.message, 'assertive');
    alert(validation.message);
    transactionIdInput?.focus();
    return;
  }
  
  // Store payment info
  checkoutState.formData.paymentMethod = paymentMethod;
  checkoutState.formData.transactionId = transactionId;
  
  // Show loading
  const submitBtn = document.querySelector('.mnext');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
  }
  
  announceToScreenReader('Processing your order...', 'polite');
  
  try {
    // Prepare order data
    const orderData = prepareOrderData(
      checkoutState.formData.customerInfo,
      getCartItems(),
      {
        method: paymentMethod,
        transactionId: transactionId,
        amount: getCartTotal()
      }
    );
    
    // Save to database
    const result = await saveOrder(orderData);
    
    if (result.success) {
      checkoutState.orderId = result.orderId;
      
      // Send email confirmation (EmailJS integration would go here)
      // await sendOrderEmail(orderData, result.orderId);
      
      // Clear cart
      clearCart();
      
      // Show confirmation
      renderStep(4);
      
      announceToScreenReader('Order placed successfully!', 'polite');
    } else {
      throw new Error(result.error || 'Failed to save order');
    }
    
  } catch (error) {
    console.error('Order submission error:', error);
    announceToScreenReader('Order submission failed. Please try again or contact support.', 'assertive');
    alert('Failed to submit order. Your cart has been preserved. Please try again or contact us via WhatsApp.');
    
    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Place Order →';
    }
  }
}

// Export for global access
if (typeof window !== 'undefined') {
  window.checkoutModule = {
    initCheckout,
    openCheckout,
    closeCheckout,
    nextStep,
    previousStep,
    submitOrder
  };
}
