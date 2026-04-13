/**
 * Database Module for TwistCraft
 * Interfaces with Vercel KV for order persistence
 */

import { announceToScreenReader } from './accessibility.js';

/**
 * Generate unique order ID
 * Format: ORD-YYYYMMDD-XXXX
 * @returns {string} Unique order ID
 */
export function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Save order to Vercel KV
 * @param {Object} orderData - Order data object
 * @returns {Promise<Object>} Result {success: boolean, orderId: string, error?: string}
 */
export async function saveOrder(orderData) {
  try {
    const orderId = generateOrderId();
    const timestamp = new Date().toISOString();
    
    const order = {
      orderId,
      timestamp,
      ...orderData,
      status: 'pending'
    };
    
    // Call Vercel serverless function
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, orderData: order })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('Order saved successfully:', orderId);
    return {
      success: true,
      orderId: result.orderId || orderId
    };
    
  } catch (error) {
    console.error('Error saving order:', error);
    return handleDatabaseError(error);
  }
}

/**
 * Retrieve order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order data or null
 */
export async function getOrder(orderId) {
  try {
    const response = await fetch(`/api/orders?orderId=${orderId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.order;
    
  } catch (error) {
    console.error('Error retrieving order:', error);
    return null;
  }
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise<boolean>} Success status
 */
export async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch('/api/orders', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, status })
    });
    
    return response.ok;
    
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

/**
 * Handle database errors gracefully
 * @param {Error} error - Error object
 * @returns {Object} Error result
 */
export function handleDatabaseError(error) {
  console.error('Database error:', error);
  
  // Determine error type
  let errorType = 'unknown';
  let userMessage = 'Failed to save order to database.';
  
  if (error.message.includes('network') || error.message.includes('fetch')) {
    errorType = 'network';
    userMessage = 'Network error. Please check your connection.';
  } else if (error.message.includes('timeout')) {
    errorType = 'timeout';
    userMessage = 'Request timed out. Please try again.';
  } else if (error.message.includes('HTTP error')) {
    errorType = 'server';
    userMessage = 'Server error. Your order confirmation has been emailed.';
  }
  
  // Announce error to screen readers
  announceToScreenReader(userMessage, 'assertive');
  
  return {
    success: false,
    error: userMessage,
    errorType,
    originalError: error.message
  };
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
export async function testConnection() {
  try {
    const response = await fetch('/api/orders?test=true');
    return response.ok;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Prepare order data for saving
 * @param {Object} customerInfo - Customer information
 * @param {Array} items - Cart items
 * @param {Object} payment - Payment information
 * @returns {Object} Formatted order data
 */
export function prepareOrderData(customerInfo, items, payment) {
  return {
    customer: {
      name: customerInfo.name.trim(),
      email: customerInfo.email.trim().toLowerCase(),
      phone: customerInfo.phone.trim(),
      address: customerInfo.address.trim()
    },
    items: items.map(item => ({
      id: item.id,
      name: item.name,
      emoji: item.emoji,
      price: item.price,
      quantity: item.quantity
    })),
    payment: {
      method: payment.method,
      transactionId: payment.transactionId.trim().toUpperCase(),
      amount: payment.amount
    }
  };
}

// Export for global access
if (typeof window !== 'undefined') {
  window.databaseModule = {
    saveOrder,
    getOrder,
    updateOrderStatus,
    generateOrderId,
    prepareOrderData,
    testConnection
  };
}
