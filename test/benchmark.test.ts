import {PatternEmitter} from '../src';

describe('Performance Benchmarks', () => {
  it('cache significantly improves repeated emit() performance', () => {
    const emitter = new PatternEmitter();
    const iterations = 1000;
    let callCount = 0;

    // Setup: Register listeners that will match
    emitter.on('test:event', () => {
      callCount++;
    });
    emitter.on(/^test:/, () => {
      callCount++;
    });
    emitter.on(/event$/, () => {
      callCount++;
    });

    // Warm up - first emit will populate cache
    emitter.emit('test:event');
    callCount = 0;

    // Benchmark: Measure cached emit performance
    const startCached = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      emitter.emit('test:event');
    }
    const endCached = process.hrtime.bigint();
    const cachedTime = Number(endCached - startCached) / 1_000_000; // Convert to ms

    // Verify all listeners were called
    expect(callCount).toBe(iterations * 3); // 3 listeners per emit

    // Performance assertion - cached emits should be fast
    const avgTimePerEmit = cachedTime / iterations;
    expect(avgTimePerEmit).toBeLessThan(0.1); // Should be under 0.1ms per emit
  });

  it('cache invalidation works correctly', () => {
    const emitter = new PatternEmitter();
    const results: string[] = [];

    emitter.on('test', () => {
      results.push('listener1');
    });
    emitter.on(/^test$/, () => {
      results.push('pattern1');
    });

    // First emit - populates cache
    emitter.emit('test');
    expect(results).toEqual(['listener1', 'pattern1']);
    results.length = 0;

    // Add new listener - should invalidate cache
    emitter.on('test', () => {
      results.push('listener2');
    });

    // Second emit - should include new listener
    emitter.emit('test');
    expect(results).toEqual(['listener1', 'pattern1', 'listener2']);
    results.length = 0;

    // Remove listener - should invalidate cache
    const toRemove = () => {
      results.push('listener1');
    };
    emitter.removeListener('test', toRemove);

    // Third emit - should not include removed listener
    emitter.emit('test');
    expect(results).toContain('pattern1');
    expect(results).toContain('listener2');
  });

  it('cache handles different event types independently', () => {
    const emitter = new PatternEmitter();
    const event1Calls: number[] = [];
    const event2Calls: number[] = [];

    emitter.on('event1', () => {
      event1Calls.push(1);
    });
    emitter.on('event2', () => {
      event2Calls.push(2);
    });
    emitter.on(/^event/, () => {
      event1Calls.push(10);
      event2Calls.push(20);
    });

    // Emit different events - each should have its own cache entry
    emitter.emit('event1');
    expect(event1Calls).toEqual([1, 10]);
    expect(event2Calls).toEqual([20]);

    event1Calls.length = 0;
    event2Calls.length = 0;

    emitter.emit('event2');
    expect(event1Calls).toEqual([10]);
    expect(event2Calls).toEqual([2, 20]);
  });

  it('cache works with complex regex patterns', () => {
    const emitter = new PatternEmitter();
    const iterations = 500;
    let matchCount = 0;

    // Complex patterns
    emitter.on(/^user:.*:login$/, () => {
      matchCount++;
    });
    emitter.on(/^user:\d+:/, () => {
      matchCount++;
    });
    emitter.on(/^user:[a-z]+:login$/, () => {
      matchCount++;
    });

    // First emit - cache miss
    emitter.emit('user:admin:login');
    const firstCount = matchCount;
    matchCount = 0;

    // Subsequent emits - cache hits
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
      emitter.emit('user:admin:login');
    }
    const end = process.hrtime.bigint();
    const totalTime = Number(end - start) / 1_000_000;

    expect(matchCount).toBe(firstCount * iterations);
  });
});

