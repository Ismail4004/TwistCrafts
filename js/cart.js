/**
 * Cart Management Module for TwistCraft
 * Manages cart state with LocalStorage persistence and UI updates
 */

import { getFromStorage, saveToStorage, formatPrice } from './utils.js';
import { announceToScreenReader } from './accessibility.js';

const CART_STORAGE_KEY = 'twistcraft_cart';

// Cart state
let cart = {
  items: [],
  total: 0,
  lastUpdated: null
};

/**
 * Initialize cart from localStorage
 */
export function initCart() {
  cart = getFromStorage(CART_STORAGE_KEY, {
    items: [],
    total: 0,
    lastUpdated: null
  });
  updateCartUI();
  console.log('Cart initialized:', cart);
}

/**
 * Add item to cart
 * @param {Object} product - Product object {id, name, emoji, price}
 * @param {number} quantity - Quantity to add (default: 1)
 */
export function addToCart(product, quantity = 1) {
  const existingItem = cart.items.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      price: product.price,
      quantity: quantity
    });
  }
  
  cart.lastUpdated = new Date().toISOString();
  saveCart();
  updateCartUI();
  announceCartChange('added', product.name);
  
  // Show toast notification
  showToast(`${product.emoji} ${product.name} added to cart`);
}

/**
 * Remove item from cart
 * @param {string} productId - Product ID
 */
export function removeFromCart(productId) {
  const item = cart.items.find(item => item.id === productId);
  if (!item) return;
  
  cart.items = cart.items.filter(item => item.id !== productId);
  cart.lastUpdated = new Date().toISOString();
  saveCart();
  updateCartUI();
  announceCartChange('removed', item.name);
}

/**
 * Update item quantity
 * @param {string} productId - Product ID
 * @param {number} quantity - New quantity
 */
export function updateQuantity(productId, quantity) {
  const item = cart.items.find(item => item.id === productId);
  if (!item) return;
  
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  item.quantity = quantity;
  cart.lastUpdated = new Date().toISOString();
  saveCart();
  updateCartUI();
  announceCartChange('updated', item.name);
}

/**
 * Get cart total
 * @returns {number} Total cart value
 */
export function getCartTotal() {
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return cart.total;
}

/**
 * Get cart items
 * @returns {Array} Cart items
 */
export function getCartItems() {
  return cart.items;
}

/**
 * Get cart item count
 * @returns {number} Total number of items
 */
export function getCartCount() {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Clear cart
 */
export function clearCart() {
  cart = {
    items: [],
    total: 0,
    lastUpdated: new Date().toISOString()
  };
  saveCart();
  updateCartUI();
  announceToScreenReader('Cart cleared', 'polite');
}

/**
 * Save cart to localStorage
 */
function saveCart() {
  saveToStorage(CART_STORAGE_KEY, cart);
}

/**
 * Update cart UI
 */
function updateCartUI() {
  updateCartCount();
  updateCartSidebar();
  updateCartTotal();
}

/**
 * Update cart count badge
 */
function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    const count = getCartCount();
    countElement.textContent = count;
    countElement.setAttribute('aria-label', `${count} items in cart`);
  }
}

/**
 * Update cart sidebar content
 */
function updateCartSidebar() {
  const cartItemsContainer = document.querySelector('.citems');
  if (!cartItemsContainer) return;
  
  if (cart.items.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cempty">
        <div>🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size: 0.85rem; color: var(--muted);">Add some handmade treasures!</p>
      </div>
    `;
    return;
  }
  
  cartItemsContainer.innerHTML = cart.items.map(item => `
    <div class="citem" data-id="${item.id}">
      <div class="cemoji" aria-hidden="true">${item.emoji}</div>
      <div class="cinf">
        <div class="cname">${item.name}</div>
        <div class="cprice">${formatPrice(item.price)}</div>
        <div class="cctrl">
          <button class="qb" onclick="window.cartModule.updateQuantity('${item.id}', ${item.quantity - 1})" aria-label="Decrease quantity">−</button>
          <span class="qn" aria-label="Quantity">${item.quantity}</span>
          <button class="qb" onclick="window.cartModule.updateQuantity('${item.id}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cdel" onclick="window.cartModule.removeFromCart('${item.id}')" aria-label="Remove ${item.name} from cart">🗑️</button>
    </div>
  `).join('');
}

/**
 * Update cart total display
 */
function updateCartTotal() {
  const totalElement = document.querySelector('.ctotal .total-amount');
  if (totalElement) {
    totalElement.textContent = formatPrice(getCartTotal());
  }
}

/**
 * Announce cart changes to screen readers
 * @param {string} action - Action performed (added, removed, updated)
 * @param {string} productName - Product name
 */
function announceCartChange(action, productName) {
  const count = getCartCount();
  const total = formatPrice(getCartTotal());
  let message = '';
  
  switch (action) {
    case 'added':
      message = `${productName} added to cart. ${count} items, total ${total}`;
      break;
    case 'removed':
      message = `${productName} removed from cart. ${count} items, total ${total}`;
      break;
    case 'updated':
      message = `${productName} quantity updated. ${count} items, total ${total}`;
      break;
  }
  
  announceToScreenReader(message, 'polite');
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 */
function showToast(message) {
  let toast = document.querySelector('.toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Open cart sidebar
 */
export function openCart() {
  const cartSide = document.querySelector('.cart-side');
  const cover = document.querySelector('.cover');
  
  if (cartSide && cover) {
    cartSide.classList.add('open');
    cover.classList.add('open');
    
    // Trap focus in cart
    const firstFocusable = cartSide.querySelector('button, a');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    announceToScreenReader('Cart opened', 'polite');
  }
}

/**
 * Close cart sidebar
 */
export function closeCart() {
  const cartSide = document.querySelector('.cart-side');
  const cover = document.querySelector('.cover');
  
  if (cartSide && cover) {
    cartSide.classList.remove('open');
    cover.classList.remove('open');
    announceToScreenReader('Cart closed', 'polite');
  }
}

// Export cart module for global access
if (typeof window !== 'undefined') {
  window.cartModule = {
    addToCart,
    removeFromCart,
    updateQuantity,
    openCart,
    closeCart,
    getCartItems,
    getCartTotal,
    getCartCount,
    clearCart
  };
}
