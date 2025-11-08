/**
 * Real-World Application Example
 * 
 * E-commerce application with order processing, notifications, and analytics
 */

import {PatternEmitter} from '../src/index';

const app = new PatternEmitter();

console.log('=== E-COMMERCE APPLICATION ===\n');

// ============================================
// 1. Order Processing System
// ============================================

// Specific order handlers
app.on('order:created', (order: any) => {
  console.log(`✅ Order #${order.id} created - Total: $${order.total}`);
});

app.on('order:paid', (order: any) => {
  console.log(`💳 Payment received for Order #${order.id}`);
});

app.on('order:shipped', (order: any) => {
  console.log(`📦 Order #${order.id} shipped via ${order.carrier}`);
});

// ============================================
// 2. Analytics - Track all order events
// ============================================

let eventCount = 0;
app.on(/^order:/, (eventData: any) => {
  eventCount++;
  console.log(`   📊 [Analytics] Order event tracked (#${eventCount})`);
});

// ============================================
// 3. Notifications - Send emails/SMS
// ============================================

app.on(/^order:(created|paid|shipped)$/, (order: any, eventType: string) => {
  console.log(`   📧 [Email] Sending ${eventType} notification to ${order.customer}`);
});

// ============================================
// 4. Logging - Log everything
// ============================================

app.on(/.*/, (data: any, context: string) => {
  console.log(`   🔍 [Logger] Event: ${context}`);
});

// ============================================
// 5. Error Handling - Catch order failures
// ============================================

app.on(/^order:.*:failed$/, (error: any) => {
  console.error(`   ❌ [Error] Order operation failed: ${error.message}`);
});

// ============================================
// Simulate Order Lifecycle
// ============================================

console.log('--- Order Lifecycle Simulation ---\n');

const order = {
  id: 12345,
  customer: 'alice@example.com',
  total: 99.99,
  carrier: 'FedEx',
};

console.log('Step 1: Create Order\n');
app.emit('order:created', order, 'created');

setTimeout(() => {
  console.log('\nStep 2: Process Payment\n');
  app.emit('order:paid', order, 'paid');

  setTimeout(() => {
    console.log('\nStep 3: Ship Order\n');
    app.emit('order:shipped', order, 'shipped');

    setTimeout(() => {
      console.log('\nStep 4: Payment Failed (Error Case)\n');
      app.emit('order:payment:failed', {
        message: 'Credit card declined',
        orderId: 12346,
      });

      console.log('\n--- Final Statistics ---\n');
      console.log(`Total events tracked: ${eventCount}`);
      console.log(`Registered event names: ${app.eventNames().length}`);
      console.log(`Registered patterns: ${app.eventPatterns().length}`);
    }, 100);
  }, 100);
}, 100);

