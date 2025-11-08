/**
 * API Routing Example
 * 
 * Demonstrates how PatternEmitter can handle API-style event routing
 * with both exact endpoints and pattern-based handlers
 */

import {PatternEmitter} from '../src/index';

const router = new PatternEmitter();

console.log('=== API ROUTING EXAMPLE ===\n');

// General request logger - catches ALL requests
router.on(/^request/, (method: string, path: string) => {
  console.log(`   📝 [Logger] ${method} ${path}`);
});

// Specific endpoint - exact match
router.on('request:users:list', () => {
  console.log('   ✓ Handler: GET /users - Listing all users');
  // Return value would be: ['Alice', 'Bob', 'Charlie']
});

// Pattern for all user-related endpoints
router.on(/^request:users:/, (action: string) => {
  console.log(`   🔍 [Middleware] User action: ${action}`);
});

// Pattern for all creation endpoints
router.on(/:create$/, (resource: string) => {
  console.log(`   ✨ [Analytics] Creating new ${resource}`);
});

// Specific endpoint - create user
router.on('request:users:create', (userData: any) => {
  console.log(`   ✓ Handler: POST /users - Creating user: ${userData.name}`);
});

// Admin-only endpoints
router.on(/^request:admin:/, (endpoint: string) => {
  console.log(`   🔐 [Auth] Admin access required for ${endpoint}`);
});

console.log('--- API Requests ---\n');

console.log('Request 1: List Users');
router.emit('request:users:list', 'GET', '/users');

console.log('\nRequest 2: Create User');
router.emit('request:users:create', 'POST', '/users', {name: 'David'});

console.log('\nRequest 3: Admin Dashboard');
router.emit('request:admin:dashboard', 'GET', '/admin/dashboard');

// Show routing statistics
console.log('\n--- Routing Statistics ---\n');
console.log(`Total endpoints: ${router.eventNames().length}`);
console.log(`Total patterns: ${router.eventPatterns().length}`);
console.log(`Handlers for "request:users:create": ${router.listenerCount('request:users:create')}`);

