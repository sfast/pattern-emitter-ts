# @sfast/pattern-emitter-ts

> Event emitters with support for regular expressions. A powerful, type-safe extension of Node's EventEmitter.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/sfast/pattern-emitter-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Full EventEmitter Compatibility** - Drop-in replacement for Node's EventEmitter  
🎯 **RegExp Pattern Matching** - Listen to events matching regular expressions  
📦 **TypeScript Native** - Built with TypeScript 5.7, fully typed  
🧪 **100% Test Coverage** - Comprehensive test suite with Jest  
⚡ **Zero Dependencies** - Lightweight and production-ready  
🔄 **Listener Ordering** - Maintains registration order across all event types

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Advanced Examples](#advanced-examples)
- [Development](#development)
- [Testing](#testing)
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
import { EventEmitter } from "events";

// After
import { PatternEmitter } from "@sfast/pattern-emitter-ts";
```

That's it! PatternEmitter is fully compatible with EventEmitter's API.

## API Documentation

### Basic Usage

PatternEmitter extends EventEmitter's API with RegExp support:

```typescript
import { PatternEmitter } from "@sfast/pattern-emitter-ts";

const emitter = new PatternEmitter();

// String events (standard EventEmitter behavior)
emitter.on("user:login", (user) => {
  console.log(`User logged in: ${user.name}`);
});

// RegExp events (pattern matching)
emitter.on(/^user:/, (data) => {
  console.log(`User event triggered: ${data}`);
});

// Both listeners will be called
emitter.emit("user:login", { name: "Alice" });
```

### Methods

All standard EventEmitter methods are supported:

- `on(event, listener)` / `addListener(event, listener)` - Add a listener
- `once(event, listener)` - Add a one-time listener
- `off(event, listener)` / `removeListener(event, listener)` - Remove a listener
- `removeAllListeners([event])` - Remove all listeners
- `emit(event, ...args)` - Emit an event
- `listenerCount(event)` - Get listener count for an event

### Pattern-Specific Methods

- `listeners` - Get the internal Map of pattern listeners
- `listenersByEventType(event)` - Get all listeners (including patterns) for an event

### Generate Full Documentation

Generate complete TypeDoc documentation:

```bash
npm run docs
```

This creates detailed API documentation in the `docs/` folder.

## Advanced Examples

### Multiple Pattern Matching

```typescript
const emitter = new PatternEmitter();

// Listen to all HTTP methods
emitter.on(/^http:(GET|POST|PUT|DELETE)$/, (method, url) => {
  console.log(`HTTP Request: ${method} ${url}`);
});

// Listen to specific method
emitter.on("http:POST", (method, url) => {
  console.log(`POST request to: ${url}`);
});

emitter.emit("http:POST", "POST", "/api/users"); // Both listeners trigger
emitter.emit("http:GET", "GET", "/api/users");   // Only pattern listener triggers
```

### Event Namespacing

```typescript
const emitter = new PatternEmitter();

// Listen to all database events
emitter.on(/^db:/, (event) => {
  console.log(`Database event: ${event.type}`);
});

// Listen to specific operations
emitter.on(/^db:.*:error$/, (error) => {
  console.error(`Database error: ${error.message}`);
});

emitter.emit("db:connection:error", { message: "Connection failed" });
emitter.emit("db:query:success", { type: "SELECT" });
```

### Listener Order Preservation

PatternEmitter maintains registration order across all listener types:

```typescript
const emitter = new PatternEmitter();
const results: string[] = [];

emitter.on("test", () => results.push("listener-1"));
emitter.on(/^test$/, () => results.push("pattern-1"));
emitter.on("test", () => results.push("listener-2"));

emitter.emit("test");
console.log(results); // ["listener-1", "pattern-1", "listener-2"]
```

### One-Time Pattern Listeners

```typescript
const emitter = new PatternEmitter();

emitter.once(/^init:/, (phase) => {
  console.log(`Initialization phase: ${phase}`);
  // This will only run once, even if multiple init events are emitted
});

emitter.emit("init:start");  // Logs: "Initialization phase: start"
emitter.emit("init:complete"); // Does not log (listener removed after first call)
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

## Testing

The project uses Jest for testing and maintains 100% code coverage:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# View coverage report
npm test -- --coverage
```

### Coverage Report

```
All files          | 100% Stmts | 100% Branch | 100% Funcs | 100% Lines
patternEmitter.ts  | 100%       | 100%        | 100%       | 100%
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

* [Artak Vardanyan](https://github.com/artakvg)
* [Armine Gevorgyan](https://github.com/mineyan)

## License

[MIT](https://github.com/sfast/patternemitter/blob/master/LICENSE)

---

Made with ❤️ by the steadfast.tech team
