/**
 * Advanced Features Example
 * 
 * Demonstrates advanced PatternEmitter capabilities:
 * - once() with patterns
 * - Listener management
 * - Execution order
 * - Dynamic handler registration
 */

import {PatternEmitter} from '../src/index';

const emitter = new PatternEmitter();

console.log('=== ADVANCED FEATURES ===\n');

// ============================================
// 1. once() - Fire listener only once
// ============================================

console.log('1️⃣  once() - Single Execution\n');

emitter.once(/^startup:/, (service: string) => {
  console.log(`   ✓ Service started: ${service} (fires once only)`);
});

emitter.emit('startup:database', 'PostgreSQL');
emitter.emit('startup:cache', 'Redis'); // Won't fire - already removed
emitter.emit('startup:server', 'Express'); // Won't fire - already removed

// ============================================
// 2. Execution Order - Maintains insertion order
// ============================================

console.log('\n2️⃣  Execution Order\n');

emitter.on('task', () => console.log('   Handler 1'));
emitter.on(/^task$/, () => console.log('   Handler 2 (regex)'));
emitter.on('task', () => console.log('   Handler 3'));

console.log('Emitting "task":');
emitter.emit('task');

// ============================================
// 3. Dynamic Handler Registration
// ============================================

console.log('\n3️⃣  Dynamic Handler Management\n');

const dynamicHandler = (msg: string) => {
  console.log(`   Dynamic: ${msg}`);
};

console.log('Adding dynamic handler...');
emitter.on('dynamic:event', dynamicHandler);

console.log('Emit with handler:');
emitter.emit('dynamic:event', 'Handler is active');

console.log('\nRemoving handler...');
emitter.removeListener('dynamic:event', dynamicHandler);

console.log('Emit without handler (should be silent):');
const hadListeners = emitter.emit('dynamic:event', 'Handler was removed');
console.log(`   Had listeners: ${hadListeners}`);

// ============================================
// 4. Listener Introspection
// ============================================

console.log('\n4️⃣  Listener Introspection\n');

emitter.on('inspect:me', () => {});
emitter.on('inspect:me', () => {});
emitter.on(/^inspect:/, () => {});

console.log(`String event listeners: ${emitter.listeners('inspect:me').length}`);
console.log(`Regex pattern listeners: ${emitter.listeners(/^inspect:/).length}`);
console.log(
  `Total matching "inspect:me": ${emitter.listenerCount('inspect:me')}`
);

// ============================================
// 5. allListeners - Get everything at once
// ============================================

console.log('\n5️⃣  All Listeners Map\n');

emitter.on('event1', () => {});
emitter.on('event2', () => {});
emitter.on(/^pattern1/, () => {});
emitter.on(/^pattern2/, () => {});

const allListeners = emitter.allListeners;
console.log(`Total unique events/patterns: ${allListeners.size}`);
allListeners.forEach((listeners, pattern) => {
  console.log(`   ${String(pattern)}: ${listeners.length} listener(s)`);
});

// ============================================
// 6. removeAllListeners - Clean up
// ============================================

console.log('\n6️⃣  Bulk Removal\n');

console.log('Before cleanup:');
console.log(`   Event names: ${emitter.eventNames().length}`);
console.log(`   Patterns: ${emitter.eventPatterns().length}`);

emitter.removeAllListeners(/^inspect:/);
console.log('\nAfter removing /^inspect:/ pattern:');
console.log(`   Patterns: ${emitter.eventPatterns().length}`);

emitter.removeAllListeners(); // Remove everything
console.log('\nAfter removeAllListeners():');
console.log(`   Event names: ${emitter.eventNames().length}`);
console.log(`   Patterns: ${emitter.eventPatterns().length}`);

// ============================================
// 7. Max Listeners Warning
// ============================================

console.log('\n7️⃣  Max Listeners (Memory Leak Prevention)\n');

emitter.setMaxListeners(3);
console.log(`Max listeners set to: ${emitter.getMaxListeners()}`);

// This would warn if we add > 3 listeners to same event
emitter.on('limited', () => {});
emitter.on('limited', () => {});
emitter.on('limited', () => {});
console.log('Added 3 listeners (at limit)');
// Adding a 4th would trigger Node.js EventEmitter warning

