# PatternEmitter Examples

This directory contains practical examples demonstrating how to use `@sfast/pattern-emitter-ts` in real-world applications.

## 🚀 Running Examples

### Prerequisites

```bash
# From the root directory
npm install
npm run build
```

### Run Individual Examples

```bash
# Basic usage
npx ts-node example/01-basic.ts

# API routing patterns
npx ts-node example/02-api-routing.ts

# Real-world e-commerce app
npx ts-node example/03-real-world-app.ts

# Advanced features
npx ts-node example/04-advanced-features.ts

# Namespace-based events
npx ts-node example/05-namespace-events.ts

# Performance benchmarks
npx ts-node example/06-benchmarks.ts
```

---

## 📚 Examples Overview

### 1. **Basic Usage** (`01-basic.ts`)

**What it demonstrates:**
- String event listeners (exact match)
- Regex pattern listeners (match multiple events)
- How multiple patterns can match the same event
- Listener introspection (`listenerCount`, `eventNames`, `eventPatterns`)

**Key concept:** Understanding the difference between exact string events and flexible regex patterns.

**Run it:**
```bash
npx ts-node example/01-basic.ts
```

---

### 2. **API Routing** (`02-api-routing.ts`)

**What it demonstrates:**
- Using PatternEmitter for API-style event routing
- Combining exact endpoints with pattern-based middleware
- Request logging, authentication, and analytics patterns
- Real-world routing statistics

**Key concept:** How to build a flexible routing system using string + regex patterns.

**Use case:** REST API handlers, middleware chains, request logging

**Run it:**
```bash
npx ts-node example/02-api-routing.ts
```

**Example pattern:**
```typescript
// Exact endpoint
router.on('request:users:list', () => { /* handler */ });

// Pattern for all user endpoints
router.on(/^request:users:/, () => { /* middleware */ });

// Pattern for all create operations
router.on(/:create$/, () => { /* analytics */ });
```

---

### 3. **Real-World Application** (`03-real-world-app.ts`)

**What it demonstrates:**
- E-commerce order processing system
- Multiple systems listening to same events:
  - Order processing
  - Analytics tracking
  - Email notifications
  - Error handling
  - Comprehensive logging
- Asynchronous event-driven architecture

**Key concept:** Building a complete application with multiple subsystems communicating via events.

**Use case:** E-commerce, order management, event-driven microservices

**Run it:**
```bash
npx ts-node example/03-real-world-app.ts
```

---

### 4. **Advanced Features** (`04-advanced-features.ts`)

**What it demonstrates:**
- `once()` - Single execution listeners
- Execution order preservation
- Dynamic handler registration/removal
- Listener introspection APIs
- `allListeners` getter for complete view
- Bulk cleanup with `removeAllListeners`
- Max listeners configuration (memory leak prevention)

**Key concept:** Advanced PatternEmitter APIs for production applications.

**Run it:**
```bash
npx ts-node example/04-advanced-features.ts
```

---

### 5. **Namespace Events** (`05-namespace-events.ts`)

**What it demonstrates:**
- Hierarchical event namespaces (colon-separated)
- Multi-level pattern matching
- Microservices communication patterns
- Namespace best practices

**Key concept:** Organizing events using namespaces for clean, scalable architecture.

**Use case:** Large applications, microservices, domain-driven design

**Run it:**
```bash
npx ts-node example/05-namespace-events.ts
```

**Example namespaces:**
```typescript
// Hierarchical organization
events.on('app:user:profile:update', handler);
events.on(/^app:user:/, middleware);
events.on(/^app:/, globalLogger);

// Service-oriented
events.on('service:auth:login', handler);
events.on('service:payment:success', handler);
```

---

### 6. **Performance Benchmarks** (`06-benchmarks.ts`)

**What it demonstrates:**
- Head-to-head comparison: EventEmitter vs PatternEmitter
- String event performance (apples to apples)
- Pattern matching overhead
- Scaling with many patterns
- Cache performance
- Listener registration costs

**Key concept:** Understanding the performance trade-offs to make informed decisions.

**Run it:**
```bash
npx ts-node example/06-benchmarks.ts
```

**Key findings:**
```
String Events:   ~50-60% overhead vs EventEmitter
Pattern Matching: PatternEmitter exclusive feature
Scalability:     Handles 100+ patterns efficiently
Best Practice:   Use PatternEmitter unless profiling shows bottleneck
```

---

## 🎯 Common Patterns

### Pattern 1: Exact Event + Wildcard Pattern

```typescript
const emitter = new PatternEmitter();

// Exact handler
emitter.on('request', () => {
  console.log('Exact request event');
});

// Wildcard for variations
emitter.on(/^request:/, () => {
  console.log('Any request:* event');
});

emitter.emit('request');          // Only first fires
emitter.emit('request:endpoint1'); // Only second fires
```

### Pattern 2: Multiple Overlapping Patterns

```typescript
// All match the same event - they all fire
emitter.on('user:login', () => {});        // Exact
emitter.on(/^user:/, () => {});            // Prefix
emitter.on(/login$/, () => {});            // Suffix
emitter.on(/.*/, () => {});                // Everything

emitter.emit('user:login'); // All 4 fire in order
```

### Pattern 3: Namespace Hierarchy

```typescript
// Broad to specific
emitter.on(/^app:/, () => {});              // Level 1: All app events
emitter.on(/^app:user:/, () => {});         // Level 2: User events
emitter.on('app:user:login', () => {});     // Level 3: Specific action

emitter.emit('app:user:login');  // All 3 fire (hierarchy)
```

---

## 💡 Best Practices

### ✅ DO

- Use **string events** for specific, known events
- Use **regex patterns** for categories or middleware
- Organize events with **namespaces** (colon-separated)
- Use `once()` for **one-time initialization** events
- Call `removeListener` to **prevent memory leaks**
- Use `listenerCount()` to **debug** listener registration

### ❌ DON'T

- Don't use overly complex regex (e.g., `/(a|b|c|d|e|f|g|h)/`)
- Don't emit events synchronously in a tight loop without `setImmediate`
- Don't forget to remove listeners when components unmount
- Don't mix event naming conventions (choose one style)

---

## 🔍 Debugging

### Check what's registered:

```typescript
// String events only
console.log(emitter.eventNames());

// Regex patterns only
console.log(emitter.eventPatterns());

// All listeners (unified view)
console.log(emitter.allListeners);

// Specific event
console.log(emitter.listeners('my:event'));
console.log(emitter.listenerCount('my:event'));
```

### Check execution:

```typescript
// Returns true if any listener fired
const hadListeners = emitter.emit('my:event');
if (!hadListeners) {
  console.log('No listeners for this event!');
}
```

---

## 📖 Further Reading

- [Full API Documentation](../README.md)
- [Test Suite](../test/) - 100 tests showing all edge cases
- [Source Code](../src/)

---

## 💬 Questions?

Open an issue on [GitHub](https://github.com/sfast/pattern-emitter-ts/issues)

