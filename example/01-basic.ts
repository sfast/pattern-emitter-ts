/**
 * Basic PatternEmitter Example
 * 
 * Shows the fundamental difference between string events and regex patterns
 */

import {PatternEmitter} from '../src/index';

const emitter = new PatternEmitter();

console.log('=== BASIC PATTERN EMITTER EXAMPLE ===\n');

// 1. String event listeners - exact match only
console.log('1️⃣  String Event Listener (exact match):');
emitter.on('user:login', (username: string) => {
  console.log(`   ✓ String listener: ${username} logged in`);
});

// 2. Regex pattern listeners - match multiple events
console.log('\n2️⃣  Regex Pattern Listener (matches multiple):');
emitter.on(/^user:/, (username: string, action: string) => {
  console.log(`   ✓ Regex listener: User action detected - ${action}`);
});

// 3. Multiple patterns can match the same event
console.log('\n3️⃣  Multiple Patterns Matching:');
emitter.on(/login$/, (username: string) => {
  console.log(`   ✓ Login pattern: Someone logged in`);
});

// Emit events and see which listeners fire
console.log('\n--- Emitting Events ---\n');

console.log('Emit: "user:login" with "Alice"');
emitter.emit('user:login', 'Alice', 'login');

console.log('\nEmit: "user:logout" with "Bob"');
emitter.emit('user:logout', 'Bob', 'logout');

console.log('\nEmit: "admin:login" with "Charlie"');
emitter.emit('admin:login', 'Charlie', 'login');

// 4. Listener counts and introspection
console.log('\n--- Introspection ---\n');
console.log(`Listeners for "user:login": ${emitter.listenerCount('user:login')}`);
console.log(`Event names registered: ${emitter.eventNames().join(', ')}`);
console.log(`Regex patterns registered: ${emitter.eventPatterns().join(', ')}`);

