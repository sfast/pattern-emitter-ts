# @sfast/pattern-emitter-ts

> EventEmitter with RegExp pattern matching - fully tested, production-ready event system for Node.js and TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/sfast/pattern-emitter-ts)
[![Tests](https://img.shields.io/badge/tests-100%20passed-brightgreen.svg)](https://github.com/sfast/pattern-emitter-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@sfast/pattern-emitter-ts.svg)](https://www.npmjs.com/package/@sfast/pattern-emitter-ts)

## Features

✨ **Full EventEmitter Compatibility** - Drop-in replacement for Node's EventEmitter  
🎯 **RegExp Pattern Matching** - Listen to events matching regular expressions  
📦 **TypeScript Native** - Built with TypeScript 5.7, fully typed  
🧪 **100% Test Coverage** - 100 comprehensive tests (77 core + 21 edge cases + 12 memory tests + 4 benchmarks)  
⚡ **Zero Dependencies** - Lightweight and production-ready  
🔄 **Listener Ordering** - Maintains registration order across all event types  
📚 **6 Runnable Examples** - Learn from real-world usage patterns

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Examples](#examples)
- [API Documentation](#api-documentation)
- [Performance](#performance)
- [Testing](#testing)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install @sfast/pattern-emitter-ts
```

or with yarn:

```bash
yarn add @sfast/pattern-emitter-ts
```

## Quick Start

Replace your EventEmitter imports:

```typescript
// Before
import {EventEmitter} from 'events';

// After
import {PatternEmitter} from '@sfast/pattern-emitter-ts';
```

That's it! PatternEmitter is fully compatible with EventEmitter's API.

### Basic Example

```typescript
import {PatternEmitter} from '@sfast/pattern-emitter-ts';

const emitter = new PatternEmitter();

// String events (exact match)
emitter.on('user:login', user => {
  console.log(`User logged in: ${user.name}`);
});

// RegExp patterns (flexible matching)
emitter.on(/^user:/, data => {
  console.log(`Any user event: ${data}`);
});

// Emit events
emitter.emit('user:login', {name: 'Alice'}); // Both listeners fire
emitter.emit('user:logout', {name: 'Alice'}); // Only pattern listener fires
```

### Real-World Example: API Routing

```typescript
const router = new PatternEmitter();

// Exact endpoint
router.on('request:users:list', () => {
  console.log('GET /users');
});

// Pattern for all user endpoints  
router.on(/^request:users:/, action => {
  console.log(`User endpoint: ${action}`);
});

// Pattern for all create operations
router.on(/:create$/, resource => {
  console.log(`Creating ${resource}`);
});

router.emit('request:users:create', 'users'); // All 3 fire!
```

## Examples

This package includes **6 comprehensive, runnable examples**:

### Run Examples

```bash
# 1. Basic Usage - String vs Regex patterns
npx ts-node example/01-basic.ts

# 2. API Routing - Request handling with patterns
npx ts-node example/02-api-routing.ts

# 3. E-Commerce App - Order processing system
npx ts-node example/03-real-world-app.ts

# 4. Advanced Features - once(), introspection, removal
npx ts-node example/04-advanced-features.ts

# 5. Namespace Events - Hierarchical event organization
npx ts-node example/05-namespace-events.ts

# 6. Performance Benchmarks - EventEmitter vs PatternEmitter
npx ts-node example/06-benchmarks.ts
```

### Example: Microservices Communication

```typescript
const events = new PatternEmitter();

// Service A: Auth events
events.on(/^service:auth:/, event => {
  console.log('Auth service:', event);
});

// Service B: Payment events
events.on(/^service:payment:/, event => {
  console.log('Payment service:', event);
});

// Global monitoring
events.on(/^service:/, event => {
  console.log('Monitor:', event);
});

events.emit('service:auth:login', {user: 'alice'});
events.emit('service:payment:success', {amount: 99});
```

See [example/README.md](./example/README.md) for detailed explanations of all examples.

## API Documentation

### Core Methods

All standard EventEmitter methods are supported:

| Method | Description |
|--------|-------------|
| `on(event, listener)` | Add a listener (alias: `addListener`) |
| `once(event, listener)` | Add a one-time listener |
| `off(event, listener)` | Remove a listener (alias: `removeListener`) |
| `removeAllListeners([event])` | Remove all listeners |
| `emit(event, ...args)` | Emit an event |
| `listenerCount(event)` | Get listener count |
| `listeners(event)` | Get listeners for an event (supports RegExp!) |

### PatternEmitter-Specific

| Method | Description |
|--------|-------------|
| `allListeners` | Getter returning Map of ALL listeners (strings + patterns) |
| `eventNames()` | Array of string/symbol event names (NOT patterns) |
| `eventPatterns()` | Array of RegExp pattern strings (NOT string events) |
| `listenersByEventType(event)` | Get all matching listeners (backward compat) |

### Event Types

```typescript
type EventPattern = string | symbol | RegExp;
type PatternListener = (...args: any[]) => void;
```

### Advanced Usage

#### Multiple Pattern Matching

```typescript
const emitter = new PatternEmitter();

// All match the same event - they all fire
emitter.on('api:user:create', () => {}); // Exact
emitter.on(/^api:/, () => {}); // Prefix
emitter.on(/create$/, () => {}); // Suffix
emitter.on(/.*/, () => {}); // Everything

emitter.emit('api:user:create'); // All 4 fire in registration order
```

#### Listener Introspection

```typescript
// Get all event names
console.log(emitter.eventNames()); // ['api:user:create']

// Get all patterns
console.log(emitter.eventPatterns()); // ['/^api:/', '/create$/', '/.*/']

// Get all listeners (unified view)
const all = emitter.allListeners; // Map<EventPattern, PatternListener[]>

// Get listeners for specific event/pattern
const stringListeners = emitter.listeners('api:user:create'); // Function[]
const patternListeners = emitter.listeners(/^api:/); // Function[]

// Count listeners
console.log(emitter.listenerCount('api:user:create')); // Includes matching patterns
```

#### Dynamic Handler Management

```typescript
const handler = data => console.log(data);

// Add
emitter.on('event', handler);

// Check if it fired
const hadListeners = emitter.emit('event', 'data'); // Returns boolean

// Remove
emitter.removeListener('event', handler);

// Remove all for event type
emitter.removeAllListeners('event');

// Remove all listeners
emitter.removeAllListeners();
```

### Generate Full Documentation

Generate complete TypeDoc documentation:

```bash
npm run docs
```

This creates detailed API documentation in the `docs/` folder.

## Performance

### Comparison with EventEmitter

**Run the benchmarks:**

```bash
npx ts-node example/06-benchmarks.ts
```

**Key Findings:**

| Metric | EventEmitter | PatternEmitter | Overhead |
|--------|--------------|----------------|----------|
| String events | 0.0003ms | 0.0005ms | ~50-60% |
| Pattern matching | ❌ N/A | ✅ Exclusive | - |
| 100 patterns | ❌ N/A | 0.0004ms | Scales well |

**Real-World Impact:** Negligible (we're talking microseconds)

### When to Use Each

| Scenario | EventEmitter | PatternEmitter |
|----------|--------------|----------------|
| Exact string matching only | ✅ Faster | ✅ Compatible |
| Pattern matching needed | ❌ Can't do | ✅ Built for this |
| Middleware/routing systems | ⚠️ Manual | ✅ Natural |
| Hierarchical namespaces | ⚠️ Verbose | ✅ Easy |
| Millions of events/sec | ✅ Optimal | ⚠️ Good enough |

**Recommendation:** Use PatternEmitter by default. The flexibility is worth the tiny overhead. Only optimize to EventEmitter if profiling shows it as a bottleneck.

## Testing

The project maintains **100% test coverage** with comprehensive test suite:

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Suite

| Category | Tests | Coverage |
|----------|-------|----------|
| **Core Functionality** | 77 tests | All APIs, emit, listeners, removal |
| **Edge Cases** | 21 tests | Overlapping patterns, special chars, boundaries |
| **Memory Management** | 12 tests | Leak prevention, cleanup, stress tests |
| **Performance** | 4 tests | Cache optimization, scaling |
| **TOTAL** | **100 tests** | **100% coverage** |

### Coverage Report

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |                   
 patternEmitter.ts |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```

## Development

### Prerequisites

- Node.js >= 14
- npm >= 6 or yarn >= 1.22

### Setup

```bash
# Clone the repository
git clone https://github.com/sfast/pattern-emitter-ts.git
cd pattern-emitter-ts

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

```bash
npm run build     # Compile TypeScript to JavaScript
npm run test      # Run tests with coverage
npm run lint      # Run ESLint
npm run fix       # Auto-fix linting issues
npm run check     # Run Google TypeScript Style checks
npm run docs      # Generate TypeDoc documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

This project uses:

- [Google TypeScript Style (gts)](https://github.com/google/gts) for code formatting
- ESLint for linting
- Jest for testing

Please ensure all tests pass and coverage remains at 100% before submitting.

## Contributors

- [Artak Vardanyan](https://github.com/artakvg)
- [Armine Gevorgyan](https://github.com/mineyan)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

## License

[MIT](https://github.com/sfast/patternemitter/blob/master/LICENSE)

---

**Made with ❤️ by the steadfast.tech team**

**Quick Links:**
- [Examples](./example/) - 6 runnable examples
- [API Documentation](./docs/) - Full TypeDoc docs (run `npm run docs`)
- [Changelog](./CHANGELOG.md) - Version history
- [Issues](https://github.com/sfast/pattern-emitter-ts/issues) - Report bugs
- [NPM Package](https://www.npmjs.com/package/@sfast/pattern-emitter-ts)
