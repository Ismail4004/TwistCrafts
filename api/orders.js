/**
 * Vercel Serverless Function for Order Management
 * Handles order persistence using Vercel KV
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Test connection
    if (req.method === 'GET' && req.query.test) {
      return res.status(200).json({ status: 'ok', message: 'Database connection successful' });
    }
    
    // Save order (POST)
    if (req.method === 'POST') {
      const { orderId, orderData } = req.body;
      
      if (!orderId || !orderData) {
        return res.status(400).json({ 
          error: 'Missing required fields: orderId and orderData' 
        });
      }
      
      // Save order to KV
      await kv.set(`order:${orderId}`, orderData);
      
      // Add to timeline (sorted set by timestamp)
      await kv.zadd('orders:timeline', {
        score: Date.now(),
        member: orderId
      });
      
      // Increment order count
      await kv.incr('orders:count');
      
      console.log(`Order saved: ${orderId}`);
      
      return res.status(200).json({
        success: true,
        orderId,
        message: 'Order saved successfully'
      });
    }
    
    // Retrieve order (GET)
    if (req.method === 'GET') {
      const { orderId } = req.query;
      
      if (!orderId) {
        return res.status(400).json({ 
          error: 'Missing required parameter: orderId' 
        });
      }
      
      const order = await kv.get(`order:${orderId}`);
      
      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found' 
        });
      }
      
      return res.status(200).json({ order });
    }
    
    // Update order status (PATCH)
    if (req.method === 'PATCH') {
      const { orderId, status } = req.body;
      
      if (!orderId || !status) {
        return res.status(400).json({ 
          error: 'Missing required fields: orderId and status' 
        });
      }
      
      // Get existing order
      const order = await kv.get(`order:${orderId}`);
      
      if (!order) {
        return res.status(404).json({ 
          error: 'Order not found' 
        });
      }
      
      // Update status
      order.status = status;
      order.lastUpdated = new Date().toISOString();
      
      // Save updated order
      await kv.set(`order:${orderId}`, order);
      
      console.log(`Order ${orderId} status updated to: ${status}`);
      
      return res.status(200).json({
        success: true,
        orderId,
        status,
        message: 'Order status updated successfully'
      });
    }
    
    // Method not allowed
    return res.status(405).json({ 
      error: 'Method not allowed' 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
