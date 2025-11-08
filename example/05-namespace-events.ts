/**
 * Namespace Events Example
 * 
 * Shows how to use colon-separated namespaces with PatternEmitter
 * for hierarchical event organization (similar to Socket.IO)
 */

import {PatternEmitter} from '../src/index';

const events = new PatternEmitter();

console.log('=== NAMESPACE EVENTS ===\n');

// ============================================
// Setup: Hierarchical Event Handlers
// ============================================

// Top-level namespace - catches everything in app
events.on(/^app:/, (data: any) => {
  console.log('   🌐 [App] Global app event');
});

// User namespace - all user events
events.on(/^app:user:/, (data: any) => {
  console.log('   👤 [User] User namespace event');
});

// Admin namespace - all admin events
events.on(/^app:admin:/, (data: any) => {
  console.log('   🔐 [Admin] Admin namespace event');
});

// Specific user actions
events.on('app:user:profile:update', (userId: string, changes: any) => {
  console.log(
    `   ✓ Handler: User ${userId} updated profile: ${JSON.stringify(changes)}`
  );
});

events.on('app:user:password:change', (userId: string) => {
  console.log(`   ✓ Handler: User ${userId} changed password`);
});

// All profile-related events
events.on(/app:user:profile:/, (action: string) => {
  console.log(`   📝 [Profile] Profile action: ${action}`);
});

// All admin actions
events.on('app:admin:users:delete', (adminId: string, targetUser: string) => {
  console.log(`   ✓ Handler: Admin ${adminId} deleted user ${targetUser}`);
});

// ============================================
// Emit Hierarchical Events
// ============================================

console.log('Event 1: User Profile Update\n');
events.emit('app:user:profile:update', 'user123', {name: 'Alice'});

console.log('\nEvent 2: User Password Change\n');
events.emit('app:user:password:change', 'user123');

console.log('\nEvent 3: Admin Delete User\n');
events.emit('app:admin:users:delete', 'admin1', 'baduser456');

// ============================================
// Real-World Use Case: Microservices Events
// ============================================

console.log('\n--- Microservices Communication ---\n');

const microservices = new PatternEmitter();

// Service A: Auth service events
microservices.on(/^service:auth:/, (event: string) => {
  console.log(`   🔑 [Auth Service] Received: ${event}`);
});

// Service B: Payment service events
microservices.on(/^service:payment:/, (event: string) => {
  console.log(`   💰 [Payment Service] Received: ${event}`);
});

// Service C: Notification service - listens to all services
microservices.on(/^service:/, (event: string, data: any) => {
  console.log(`   📬 [Notification] Broadcasting: ${event}`);
});

console.log('Auth Event:');
microservices.emit('service:auth:login', {user: 'alice'});

console.log('\nPayment Event:');
microservices.emit('service:payment:success', {amount: 99.99});

console.log('\nCross-Service Event:');
microservices.emit('service:inventory:update', {sku: 'ABC123'});

// ============================================
// Namespace Best Practices
// ============================================

console.log('\n--- Namespace Structure ---\n');
console.log('✓ Use colons (:) for hierarchical separation');
console.log('✓ Start with broad namespace (app, service, domain)');
console.log('✓ Add specificity left to right');
console.log('✓ Use regex patterns for namespace-level handlers');
console.log('\nExamples:');
console.log('  - app:user:profile:update');
console.log('  - service:payment:webhook:stripe');
console.log('  - domain:order:lifecycle:shipped');

