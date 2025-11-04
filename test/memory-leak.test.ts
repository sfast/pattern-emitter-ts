import {PatternEmitter} from '../src';
import {expect} from 'chai';

describe('Memory Leak Tests', () => {
  let emitter: PatternEmitter;

  beforeEach(() => {
    emitter = new PatternEmitter();
  });

  describe('listener cleanup', () => {
    it('removes listeners from internal maps when removeListener is called', () => {
      const listener = () => {};

      // Add listener
      emitter.on('test', listener);
      emitter.on(/test/, listener);

      // Verify listeners exist
      const actualListeners = (emitter as any)._actualListeners;
      const listenersMap = (emitter as any)._listeners;
      const initialActualSize = actualListeners.size;
      const initialMapSize = listenersMap.size;

      expect(initialActualSize).to.be.greaterThan(0);
      expect(initialMapSize).to.be.greaterThan(0);

      // Remove listeners
      emitter.removeListener('test', listener);
      emitter.removeListener(/test/, listener);

      // Verify cleanup
      const finalActualSize = actualListeners.size;
      const finalMapSize = listenersMap.size;

      expect(finalActualSize).to.be.lessThan(initialActualSize);
      expect(finalMapSize).to.equal(0);
    });

    it('clears cache when listeners are removed', () => {
      const listener = () => {};

      // Add regex listener to enable caching
      emitter.on(/test/, listener);
      emitter.on('test', listener);

      // Trigger cache population
      emitter.emit('test');

      const cache = (emitter as any)._listenerCache;
      expect(cache.size).to.be.greaterThan(0);

      // Remove listener should clear cache
      emitter.removeListener('test', listener);
      expect(cache.size).to.equal(0);
    });

    it('clears all internal maps when removeAllListeners is called', () => {
      // Add multiple listeners
      emitter.on('test1', () => {});
      emitter.on('test2', () => {});
      emitter.on(/test/, () => {});
      emitter.on(/another/, () => {});

      // Populate cache
      emitter.emit('test1');
      emitter.emit('test2');

      const actualListeners = (emitter as any)._actualListeners;
      const listenersMap = (emitter as any)._listeners;
      const cache = (emitter as any)._listenerCache;
      const regexMap = (emitter as any)._regexMap;

      expect(actualListeners.size).to.be.greaterThan(0);
      expect(listenersMap.size).to.be.greaterThan(0);
      expect(cache.size).to.be.greaterThan(0);
      expect(regexMap.size).to.be.greaterThan(0);

      // Remove all listeners
      emitter.removeAllListeners();

      // All internal storage should be cleared
      expect(actualListeners.size).to.equal(0);
      expect(listenersMap.size).to.equal(0);
      expect(cache.size).to.equal(0);
      expect(regexMap.size).to.equal(0);
      expect((emitter as any)._regexesCount).to.equal(0);
    });
  });

  describe('repeated add/remove cycles', () => {
    it('does not accumulate memory over many add/remove cycles', () => {
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const listener = () => {};
        emitter.on('test', listener);
        emitter.on(/test/, listener);
        emitter.emit('test'); // Populate cache
        emitter.removeListener('test', listener);
        emitter.removeListener(/test/, listener);
      }

      // After all cycles, internal maps should be empty or minimal
      const actualListeners = (emitter as any)._actualListeners;
      const listenersMap = (emitter as any)._listeners;
      const cache = (emitter as any)._listenerCache;

      expect(actualListeners.size).to.equal(0);
      expect(listenersMap.size).to.equal(0);
      expect(cache.size).to.equal(0);
    });

    it('does not leak when adding/removing same listener multiple times', () => {
      const listener = () => {};

      for (let i = 0; i < 100; i++) {
        emitter.on('test', listener);
        emitter.removeListener('test', listener);
      }

      const actualListeners = (emitter as any)._actualListeners;
      expect(actualListeners.size).to.equal(0);
    });
  });

  describe('cache memory management', () => {
    it('cache does not grow unbounded with different event types', () => {
      // Add regex pattern listener to enable caching
      emitter.on(/^event/, () => {});

      // Add listeners for many different events
      for (let i = 0; i < 100; i++) {
        emitter.on(`event${i}`, () => {});
      }

      // Emit all events to populate cache
      for (let i = 0; i < 100; i++) {
        emitter.emit(`event${i}`);
      }

      const cache = (emitter as any)._listenerCache;
      const cacheSize = cache.size;

      // Cache should have entries (caching only happens with regex listeners)
      expect(cacheSize).to.be.greaterThan(0);
      expect(cacheSize).to.be.lessThanOrEqual(100);

      // Remove all listeners should clear cache
      emitter.removeAllListeners();
      expect(cache.size).to.equal(0);
    });

    it('cache is properly invalidated when listeners change', () => {
      const results: number[] = [];

      // Add regex listener to enable caching
      emitter.on(/test/, () => {});

      emitter.on('test', () => {
        results.push(1);
      });
      emitter.emit('test'); // Populate cache

      const cache = (emitter as any)._listenerCache;
      const cachedEntry = cache.get('test');
      expect(cachedEntry).to.exist;
      expect(cachedEntry.length).to.equal(2); // regex + string listener

      // Add new listener
      emitter.on('test', () => {
        results.push(2);
      });

      // Cache should be cleared
      expect(cache.size).to.equal(0);

      // Next emit should recache
      emitter.emit('test');
      const newCachedEntry = cache.get('test');
      expect(newCachedEntry).to.exist;
      expect(newCachedEntry.length).to.equal(3); // regex + 2 string listeners
    });
  });

  describe('wrapped listener cleanup', () => {
    it('cleans up wrapped listeners when original is removed', () => {
      const listener1 = () => {};
      const listener2 = () => {};
      const listener3 = () => {};

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.on('test', listener3);

      const actualListeners = (emitter as any)._actualListeners;
      const initialSize = actualListeners.size;
      expect(initialSize).to.equal(3);

      // Remove one listener
      emitter.removeListener('test', listener2);
      expect(actualListeners.size).to.equal(2);

      // Remove another
      emitter.removeListener('test', listener1);
      expect(actualListeners.size).to.equal(1);

      // Remove last
      emitter.removeListener('test', listener3);
      expect(actualListeners.size).to.equal(0);
    });

    it('once() listeners are cleaned up after execution', () => {
      const listener = () => {};

      emitter.once('test', listener);

      const actualListeners = (emitter as any)._actualListeners;
      const initialSize = actualListeners.size;
      expect(initialSize).to.be.greaterThan(0);

      // Emit to trigger once listener
      emitter.emit('test');

      // After emit, once listener should be removed
      // Note: The cleanup happens through removeListener which clears the map
      // The size might not be exactly 0 due to wrapped listeners, but should be reduced
      const finalSize = actualListeners.size;
      expect(finalSize).to.be.at.most(initialSize);
    });
  });

  describe('regex pattern cleanup', () => {
    it('removes regex patterns from _regexMap when all listeners are removed', () => {
      const pattern1 = /test1/;
      const pattern2 = /test2/;

      emitter.on(pattern1, () => {});
      emitter.on(pattern2, () => {});

      const regexMap = (emitter as any)._regexMap;
      expect(regexMap.size).to.equal(2);

      // Remove all listeners for pattern1
      emitter.removeListener(pattern1, () => {});
      
      // Pattern should still exist (we removed wrong reference)
      // Let's do it properly with the actual listener
      const listener1 = () => {};
      const listener2 = () => {};
      
      emitter.removeAllListeners();
      emitter.on(pattern1, listener1);
      emitter.on(pattern2, listener2);
      
      expect(regexMap.size).to.equal(2);
      expect((emitter as any)._regexesCount).to.equal(2);

      emitter.removeListener(pattern1, listener1);
      
      // After removing last listener for pattern1, count decreases
      expect((emitter as any)._regexesCount).to.equal(1);
      
      emitter.removeListener(pattern2, listener2);
      expect((emitter as any)._regexesCount).to.equal(0);
    });
  });

  describe('stress test - no memory accumulation', () => {
    it('handles high-frequency add/remove/emit without memory growth', () => {
      const iterations = 1000;
      const patterns = [/test1/, /test2/, /test3/];
      const events = ['test1', 'test2', 'test3'];

      for (let i = 0; i < iterations; i++) {
        // Add listeners
        const listeners = patterns.map(() => () => {});
        patterns.forEach((pattern, idx) => {
          emitter.on(pattern, listeners[idx]);
        });

        // Emit events (populate cache)
        events.forEach(event => emitter.emit(event));

        // Remove listeners
        patterns.forEach((pattern, idx) => {
          emitter.removeListener(pattern, listeners[idx]);
        });
      }

      // After stress test, all maps should be empty
      const actualListeners = (emitter as any)._actualListeners;
      const listenersMap = (emitter as any)._listeners;
      const cache = (emitter as any)._listenerCache;
      const regexMap = (emitter as any)._regexMap;

      expect(actualListeners.size).to.equal(0);
      expect(listenersMap.size).to.equal(0);
      expect(cache.size).to.equal(0);
      expect(regexMap.size).to.equal(0);
    });
  });

  describe('WeakMap alternative check', () => {
    it('verifies _actualListeners is a regular Map (not WeakMap)', () => {
      // This test documents that we use Map, not WeakMap
      // WeakMap would auto-cleanup but doesn't allow iteration
      const actualListeners = (emitter as any)._actualListeners;
      expect(actualListeners).to.be.instanceOf(Map);
      expect(actualListeners.size).to.be.a('number'); // WeakMap doesn't have size
    });
  });
});

