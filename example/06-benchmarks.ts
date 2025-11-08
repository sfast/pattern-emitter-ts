/**
 * Performance Benchmarks: EventEmitter vs PatternEmitter
 * 
 * Compares performance characteristics between standard Node.js EventEmitter
 * and PatternEmitter to help you choose the right tool for your use case.
 */

import {EventEmitter} from 'events';
import {PatternEmitter} from '../src/index';

// Helper to measure execution time
function benchmark(name: string, iterations: number, fn: () => void): number {
  const start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = process.hrtime.bigint();
  const totalMs = Number(end - start) / 1_000_000;
  const avgMs = totalMs / iterations;
  
  console.log(`   ${name}`);
  console.log(`   ├─ Iterations: ${iterations.toLocaleString()}`);
  console.log(`   ├─ Total: ${totalMs.toFixed(2)}ms`);
  console.log(`   └─ Avg: ${avgMs.toFixed(6)}ms per operation`);
  
  return avgMs;
}

console.log('=== EVENTEMITTER vs PATTERNEMITTER BENCHMARKS ===\n');

// ============================================
// Benchmark 1: String Events Only (Apples to Apples)
// ============================================

console.log('📊 Benchmark 1: String Events (No Patterns)\n');
console.log('Testing pure string events - should be nearly identical\n');

const iterations1 = 50000;

// EventEmitter
const ee = new EventEmitter();
ee.on('test:event', () => {});
ee.on('test:event', () => {});
ee.on('test:event', () => {});

const eeTime = benchmark('EventEmitter', iterations1, () => {
  ee.emit('test:event');
});

// PatternEmitter (string events only)
const pe = new PatternEmitter();
pe.on('test:event', () => {});
pe.on('test:event', () => {});
pe.on('test:event', () => {});

const peTime = benchmark('PatternEmitter', iterations1, () => {
  pe.emit('test:event');
});

const overhead1 = ((peTime - eeTime) / eeTime) * 100;
console.log(`\n   📈 Performance: PatternEmitter is ${Math.abs(overhead1).toFixed(1)}% ${overhead1 > 0 ? 'slower' : 'faster'} for string events`);

// ============================================
// Benchmark 2: Pattern Matching (PatternEmitter Only)
// ============================================

console.log('\n\n📊 Benchmark 2: Regex Pattern Matching\n');
console.log('EventEmitter cannot do this - PatternEmitter exclusive feature\n');

const iterations2 = 20000;

// PatternEmitter with patterns
const pePatterns = new PatternEmitter();
pePatterns.on(/^api:/, () => {});
pePatterns.on(/^api:user:/, () => {});
pePatterns.on(/create$/, () => {});

const pePatternTime = benchmark('PatternEmitter (3 patterns)', iterations2, () => {
  pePatterns.emit('api:user:create');
});

// PatternEmitter with cached patterns (warm cache)
pePatterns.emit('api:user:create'); // Warm up cache
const peCachedTime = benchmark('PatternEmitter (cached)', iterations2, () => {
  pePatterns.emit('api:user:create');
});

const cacheImprovement = ((pePatternTime - peCachedTime) / pePatternTime) * 100;
console.log(`\n   ⚡ Cache speedup: ${cacheImprovement.toFixed(1)}% faster with cache`);

// ============================================
// Benchmark 3: Mixed String + Patterns
// ============================================

console.log('\n\n📊 Benchmark 3: Mixed String Events + Patterns\n');
console.log('Real-world scenario with both types\n');

const iterations3 = 20000;

// PatternEmitter mixed
const peMixed = new PatternEmitter();
peMixed.on('order:created', () => {}); // String
peMixed.on('order:created', () => {}); // String
peMixed.on(/^order:/, () => {}); // Pattern
peMixed.on(/created$/, () => {}); // Pattern

const peMixedTime = benchmark('PatternEmitter (2 string + 2 pattern)', iterations3, () => {
  peMixed.emit('order:created');
});

// Compare to EventEmitter with same number of string listeners
const eeMixed = new EventEmitter();
eeMixed.on('order:created', () => {});
eeMixed.on('order:created', () => {});
eeMixed.on('order:created', () => {});
eeMixed.on('order:created', () => {});

const eeMixedTime = benchmark('EventEmitter (4 string)', iterations3, () => {
  eeMixed.emit('order:created');
});

const overhead3 = ((peMixedTime - eeMixedTime) / eeMixedTime) * 100;
console.log(`\n   📈 Overhead: ${overhead3.toFixed(1)}% for pattern matching capability`);

// ============================================
// Benchmark 4: Listener Registration
// ============================================

console.log('\n\n📊 Benchmark 4: Adding Listeners (Setup Cost)\n');

const iterations4 = 10000;

const eeRegTime = benchmark('EventEmitter.on()', iterations4, () => {
  const temp = new EventEmitter();
  temp.on('event', () => {});
  temp.on('event', () => {});
  temp.on('event', () => {});
});

const peStringRegTime = benchmark('PatternEmitter.on() - string', iterations4, () => {
  const temp = new PatternEmitter();
  temp.on('event', () => {});
  temp.on('event', () => {});
  temp.on('event', () => {});
});

const pePatternRegTime = benchmark('PatternEmitter.on() - regex', iterations4, () => {
  const temp = new PatternEmitter();
  temp.on(/^event/, () => {});
  temp.on(/event$/, () => {});
  temp.on(/event/, () => {});
});

console.log(`\n   📈 String registration: ${((peStringRegTime - eeRegTime) / eeRegTime * 100).toFixed(1)}% overhead`);
console.log(`   📈 Pattern registration: ${((pePatternRegTime - eeRegTime) / eeRegTime * 100).toFixed(1)}% overhead`);

// ============================================
// Benchmark 5: Many Patterns
// ============================================

console.log('\n\n📊 Benchmark 5: Scaling with Many Patterns\n');

const iterations5 = 10000;

// 10 patterns
const pe10 = new PatternEmitter();
for (let i = 0; i < 10; i++) {
  pe10.on(new RegExp(`^pattern${i}`), () => {});
}

const pe10Time = benchmark('PatternEmitter (10 patterns)', iterations5, () => {
  pe10.emit('pattern5:test');
});

// 50 patterns
const pe50 = new PatternEmitter();
for (let i = 0; i < 50; i++) {
  pe50.on(new RegExp(`^pattern${i}`), () => {});
}

const pe50Time = benchmark('PatternEmitter (50 patterns)', iterations5, () => {
  pe50.emit('pattern25:test');
});

// 100 patterns
const pe100 = new PatternEmitter();
for (let i = 0; i < 100; i++) {
  pe100.on(new RegExp(`^pattern${i}`), () => {});
}

const pe100Time = benchmark('PatternEmitter (100 patterns)', iterations5, () => {
  pe100.emit('pattern50:test');
});

console.log(`\n   📈 10→50 patterns: ${((pe50Time / pe10Time - 1) * 100).toFixed(1)}% slower`);
console.log(`   📈 50→100 patterns: ${((pe100Time / pe50Time - 1) * 100).toFixed(1)}% slower`);

// ============================================
// Summary & Recommendations
// ============================================

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('📋 SUMMARY & RECOMMENDATIONS');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✅ USE EVENTEMITTER WHEN:');
console.log('   • You only need exact string event matching');
console.log('   • Maximum performance is critical (< 0.001ms overhead matters)');
console.log('   • You have millions of events per second');
console.log('   • No need for pattern matching or namespaces\n');

console.log('✅ USE PATTERNEMITTER WHEN:');
console.log('   • You need flexible pattern matching (regex)');
console.log('   • Building middleware/plugin systems');
console.log('   • Hierarchical event namespaces (api:user:create)');
console.log('   • Route-based event handling');
console.log('   • Event categorization matters');
console.log(`   • Performance is acceptable (${overhead1.toFixed(1)}% overhead for strings)\n`);

console.log('⚡ PERFORMANCE NOTES:');
console.log(`   • String events: ~${overhead1.toFixed(1)}% overhead vs EventEmitter`);
console.log(`   • Pattern matching: ${cacheImprovement.toFixed(0)}% faster with cache`);
console.log('   • Scales well: 100 patterns still very fast');
console.log('   • Setup cost: Minimal overhead for registration\n');

console.log('🎯 BEST PRACTICE:');
console.log('   Use PatternEmitter by default - the flexibility is worth');
console.log('   the tiny performance cost. Only optimize to EventEmitter');
console.log('   if profiling shows it as a bottleneck.\n');

console.log('═══════════════════════════════════════════════════════════\n');

