# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 09.11.2025

### 🎉 Major Release - Production Ready

### Added
- ✅ **100 comprehensive tests** with 100% code coverage
  - 77 core functionality tests
  - 21 advanced edge case tests
  - 12 memory leak prevention tests
  - 4 performance benchmark tests
- ✅ **6 runnable examples** demonstrating real-world usage
  - Basic usage (string vs regex patterns)
  - API routing with middleware
  - E-commerce application architecture
  - Advanced features (once, introspection, removal)
  - Namespace-based event organization
  - Performance benchmarks (EventEmitter vs PatternEmitter)
- ✅ **EventEmitter-compatible API enhancements**
  - `listeners(event)` method accepting both string/symbol AND RegExp
  - `allListeners` getter for unified view of all listeners
  - `eventNames()` returning string/symbol events
  - `eventPatterns()` returning RegExp patterns
- ✅ **Comprehensive documentation**
  - Updated README with examples and best practices
  - Example README with detailed explanations
  - Performance comparison guide

### Changed
- 🔄 **Refactored to use inheritance** instead of composition
  - `class PatternEmitter extends EventEmitter`
  - Cleaner codebase, better performance
  - True `instanceof EventEmitter` compatibility
- 🚀 **Performance optimizations**
  - Removed unnecessary closures in `wrapListener`
  - Eliminated `.bind()` overhead in hot paths
  - Static empty array constant for better memory usage
  - Removed redundant `instanceof` checks
  - ~50 lines of code removed while improving performance
- 📚 **API improvements**
  - Renamed `listeners` getter to `allListeners` for clarity
  - Added EventEmitter-compatible `listeners(event)` method
  - Properly override `on` and `off` to accept `EventPattern` types

### Fixed
- 🐛 Fixed memory tracking for string event listeners
- 🐛 Fixed context binding issues with EventEmitter methods
- 🐛 Improved cleanup logic for wrapped listeners
- 🐛 Fixed `once()` cleanup for both string and regex patterns

### Performance
- ⚡ String events: ~50-60% overhead vs EventEmitter (0.0003ms → 0.0005ms)
- ⚡ Pattern matching: PatternEmitter exclusive feature
- ⚡ Scales efficiently: 100+ patterns with minimal overhead
- ⚡ Cache optimization: Significant speedup for repeated emits

### Documentation
- 📖 Consolidated all documentation into main README
- 📖 Added performance comparison and recommendations
- 📖 Included 6 runnable examples with explanations
- 📖 Comprehensive test coverage documentation

---

## [0.2.5] - Previous

### Features
- Pattern matching with RegExp
- Basic EventEmitter compatibility
- TypeScript support

---

## [0.0.9] - 2019-07-29

### Changed
- Fixed the typedoc generation
- Test coverage 98% (Thx Armine)

## [0.0.2, 0.0.3] - 2019-06-25

### Added
- Added listeners getter
- Changed listeners function to listenersByEventType

## [0.0.1] - 2019-06-21

### Added
- Initial stable release
- Basic pattern emitter functionality
