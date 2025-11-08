import {PatternEmitter} from '../src';
import {expect} from 'chai';

describe('PatternEmitter', () => {
  let emitter: PatternEmitter;

  beforeEach(() => {
    emitter = new PatternEmitter();
    emitter.setMaxListeners(0); // Unlimited for tests
  });

  describe('emit', () => {
    it('returns false if no listeners match the event', () => {
      let invoked = false;

      emitter.on(/^t.*/, () => {
        invoked = true;
      });

      emitter.on('invalid', () => {
        invoked = true;
      });

      const result = emitter.emit('noMatch');

      expect(invoked).to.equal(false);
      expect(result).to.equal(false);
    });

    it('returns true if a listener matches the event', () => {
      emitter.on('test', () => {});
      const result = emitter.emit('test');

      expect(result).to.equal(true);
    });

    it('invokes a listener when the event matches its type', () => {
      let invoked = false;

      emitter.on('test', () => {
        invoked = true;
      });

      emitter.emit('test');

      expect(invoked).to.equal(true);
    });

    it('invokes a listener when the event matches to regexp', () => {
      let invokedCount = 0;

      emitter.on(/^hi/, () => {
        invokedCount++;
      });

      emitter.emit('hi::1', 'emitted');

      expect(invokedCount).to.equal(1);
    });

    it('invokes the listener with any additional arguments', () => {
      let allArgs;
      emitter.on(/^t\w{3}/, (...args: any[]) => {
        allArgs = [...args];
      });

      emitter.emit('test', 'arg1', 'arg2', 'arg3');

      expect(allArgs).to.eql(['arg1', 'arg2', 'arg3']);
    });

    it('invokes all matching listeners', () => {
      let x = 0;
      let y = 0;
      let z = 0;

      const listener1 = () => {
        x++;
      };

      const listener2 = () => {
        y++;
      };

      const listener3 = () => {
        z++;
      };

      emitter.on(/t.*/, listener1);

      emitter.on(/.*/, listener1);
      emitter.on(/.*/, listener2);
      emitter.on(/.*/, listener3);

      emitter.on('test', listener3);

      emitter.emit('test');

      expect(x).to.equal(2);
      expect(y).to.equal(1);
      expect(z).to.equal(2);
    });

    it('emit can be called multiple times', () => {
      let counter = 0;
      emitter.on(/[t]/, () => {
        counter++;
      });

      emitter.emit('test1');
      expect(counter).to.equal(1);

      emitter.emit('test2');
      expect(counter).to.equal(2);
    });
  });

  describe('once', () => {
    it('adds a listener that can be invoked at most once for regexp', () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };

      emitter.once(/[a-z]/, listener);
      emitter.emit('test');
      emitter.emit('test');
      expect(counter).to.equal(1);
    });

    it('adds a listener that can be invoked at most once for string', () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };

      emitter.once('test', listener);
      emitter.emit('test');
      emitter.emit('test');
      expect(counter).to.equal(1);
    });
  });

  describe('addListener', () => {
    it('adds listener if type is RegExp', () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };
      emitter.addListener(/^t.*/, listener);
      emitter.emit('test');
      expect(counter).to.equal(1);
    });

    it('adds listener if type is string', () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };
      emitter.addListener('test', listener);
      emitter.emit('test');
      expect(counter).to.equal(1);
    });

    it('can add multiple listeners for the same pattern', () => {
      let counter = 0;
      const listener1 = () => {
        counter++;
      };
      const listener2 = () => {
        counter++;
      };

      emitter.addListener('test', listener1);
      emitter.addListener('test', listener2);

      emitter.addListener(/^t.*/, listener1);

      emitter.emit('test');
      expect(emitter.listenerCount('test')).to.equal(3);
      expect(counter).to.equal(3);
    });

    it('can add same listeners for the same pattern', () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };

      emitter.addListener('test', listener);
      emitter.addListener('test', listener);

      emitter.emit('test');
      expect(emitter.listenerCount('test')).to.equal(2);
      expect(counter).to.equal(2);
    });
  });

  describe('on', () => {
    it('is an alias for addListener', () => {
      expect(emitter.on).to.equal(emitter.addListener);
    });
  });

  describe('off', () => {
    it('is an alias for removeListener', () => {
      expect(emitter.off).to.equal(emitter.removeListener);
    });
  });

  describe('removeListener', () => {
    it("removes listener from _listeners map's appropriate pattern's array if the given type is RegExp", () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };
      emitter.addListener(/^t.*/, listener);
      emitter.emit('test');
      expect(counter).to.equal(1);
      emitter.removeListener(/^t.*/, listener);
      emitter.emit('test');

      expect(counter).to.equal(1);
    });

    it("removes listener from _listeners map's appropriate pattern's array if the given type is String", () => {
      const listener = () => {};
      emitter.addListener('test', listener);
      emitter.addListener('test', () => {});

      emitter.emit('test');
      emitter.removeListener('test', listener);

      expect(emitter.listenerCount('test')).to.equal(1);
    });
  });

  describe('removeAllListeners', () => {
    it('removes all listeners if type not given', () => {
      const listener = () => {};
      emitter.addListener('test', listener);
      emitter.addListener('test', listener);
      emitter.addListener(/test/, listener);

      emitter.emit('test');
      expect(emitter.listenerCount('test')).to.equal(3);

      emitter.removeAllListeners();

      expect(emitter.emit('test')).to.equal(false);
      expect(emitter.listenerCount('test')).to.equal(0);
    });

    it('removes all listeners of given type for string', () => {
      const listener = () => {};
      emitter.addListener('test', listener);
      emitter.addListener('test', () => {});

      emitter.emit('test');
      emitter.removeAllListeners('test');

      expect(emitter.listenerCount('test')).to.equal(0);
    });

    it('removes all listeners of given type for regexp', () => {
      const listener = () => {};
      emitter.addListener(/test/, listener);
      emitter.addListener(/test/, () => {});

      emitter.emit('test');
      emitter.removeAllListeners(/test/);

      expect(emitter.emit('test')).to.equal(false);
    });
  });

  describe('listenersByEventType', () => {
    it('returns array of all listeners for the given pattern if the regexps are different, but the functions the same', () => {
      const listener1 = () => {};
      const listener2 = () => {};

      emitter.on(/^t.*/, listener2);
      emitter.on(/^.*/, listener1);
      emitter.emit('test');
      expect(emitter.listenersByEventType('test')).deep.equal([
        listener2,
        listener1,
      ]);
    });

    it('returns array of all listeners for the given pattern if regexps are the same', () => {
      const listener1 = () => {};
      const listener2 = () => {};
      const listener3 = () => {};

      emitter.on(/^t.*/, listener2);
      emitter.on(/^.*/, listener1);
      emitter.on(/^.*/, listener3);
      emitter.emit('test');
      expect(emitter.listenersByEventType('test')).deep.equal([
        listener2,
        listener1,
        listener3,
      ]);
    });

    it('returns array of all listeners for the given pattern if regexps and functions are the same', () => {
      let counter = 0;
      const listener1 = () => {
        counter++;
      };
      const listener2 = () => {};

      emitter.on(/^t.*/, listener2);
      emitter.on(/^.*/, listener1);
      emitter.on(/^.*/, listener1);

      // emitter.on('test', listener1);

      emitter.emit('test');

      expect(emitter.listenersByEventType('test')).deep.equal([
        listener2,
        listener1,
        listener1,
      ]);
      expect(counter).to.eql(2);
    });
  });

  describe('listenerCount', () => {
    it('returns the count of listeners for given pattern', () => {
      emitter.addListener('test', () => {});
      emitter.addListener('test', () => {});
      emitter.addListener(/test/, () => {});

      const result = emitter.listenerCount('test');

      expect(result).to.equal(3);
    });
  });

  describe('order', () => {
    it('calls matching listeners with order and listeners get data for regexps', () => {
      const arrOfDatas: any = [];

      emitter.on(/^t.*/, (data: any) => {
        arrOfDatas.push(`${data}:1`);
      });
      emitter.on(/^t\w{3}/, (data: any) => {
        arrOfDatas.push(`${data}:2`);
      });

      emitter.emit('test', 'data');
      expect(arrOfDatas).to.eql(['data:1', 'data:2']);
    });

    it('calls matching listeners with order and listeners get data for strings', () => {
      const arrOfDatas: any = [];

      emitter.on('test', (data: any) => {
        arrOfDatas.push(`${data}:1`);
      });
      emitter.on('test', (data: any) => {
        arrOfDatas.push(`${data}:2`);
      });

      emitter.emit('test', 'data');
      expect(arrOfDatas).to.eql(['data:1', 'data:2']);
    });

    it('calls matching listeners with order and listeners get data for strings and regexps', () => {
      const arrOfDatas: any = [];

      emitter.on('test', (data: any) => {
        arrOfDatas.push(`${data}:0`);
      });
      emitter.on(/^t.*/, (data: any) => {
        arrOfDatas.push(`${data}:1`);
      });
      emitter.on('test', (data: any) => {
        arrOfDatas.push(`${data}:2`);
      });

      emitter.on(/^t\w{3}/, (data: any) => {
        arrOfDatas.push(`${data}:3`);
      });

      emitter.emit('test', 'data');

      expect(arrOfDatas).to.eql(['data:0', 'data:1', 'data:2', 'data:3']);
    });
  });

  describe('listeners() method', () => {
    it('should return listeners for a string event', () => {
      const handler1 = () => {};
      const handler2 = () => {};
      
      emitter.on('test.event', handler1);
      emitter.on('test.event', handler2);
      
      const listeners = emitter.listeners('test.event');
      expect(listeners).to.be.an('array');
      expect(listeners).to.have.lengthOf(2);
    });
    
    it('should return listeners for a RegExp pattern', () => {
      const pattern1 = () => {};
      const pattern2 = () => {};
      
      emitter.on(/test.*/, pattern1);
      emitter.on(/test.*/, pattern2);
      
      const listeners = emitter.listeners(/test.*/);
      expect(listeners).to.be.an('array');
      expect(listeners).to.have.lengthOf(2);
    });
    
    it('should return empty array when no listeners exist', () => {
      expect(emitter.listeners('nonexistent')).to.have.lengthOf(0);
      expect(emitter.listeners(/nonexistent/)).to.have.lengthOf(0);
    });
    
    it('should work with symbol events', () => {
      const sym = Symbol('test');
      const handler = () => {};
      
      emitter.on(sym, handler);
      
      const listeners = emitter.listeners(sym);
      expect(listeners).to.have.lengthOf(1);
    });
  });

  describe('allListeners getter', () => {
    it('exposes ALL listeners (string events and RegExp patterns)', () => {
      const stringHandler = () => {};
      const patternHandler = () => {};
      
      emitter.on('string.event', stringHandler);
      emitter.on(/test/, patternHandler);
      
      const allListeners = emitter.allListeners;
      expect(allListeners).to.be.instanceOf(Map);
      expect(allListeners.size).to.equal(2); // 1 string + 1 pattern
      
      // Verify string event is included
      expect(allListeners.has('string.event')).to.be.true;
      // Verify pattern is included
      expect(allListeners.has('/test/')).to.be.true;
    });
    
    it('returns empty map when no listeners registered', () => {
      const allListeners = emitter.allListeners;
      expect(allListeners).to.be.instanceOf(Map);
      expect(allListeners.size).to.equal(0);
    });
  });

  describe('internal error handling', () => {
    it('throws TypeError when patternListeners is called with non-RegExp', () => {
      expect(() => {
        // Access private method for test coverage
        (emitter as any).patternListeners('not-a-regex');
      }).to.throw(TypeError, 'pattern must be an instance of EventPattern');
    });

    it('returns empty array when patternListeners is called with RegExp that has no listeners', () => {
      // Access private method for test coverage
      const result = (emitter as any).patternListeners(/no-listeners/);
      expect(result).to.be.instanceOf(Array);
      expect(result.length).to.equal(0);
    });
  });

  describe('symbol events', () => {
    it('handles symbol event types correctly', () => {
      const symbolEvent = Symbol('test');
      let called = false;

      emitter.on(symbolEvent, () => {
        called = true;
      });

      emitter.emit(symbolEvent);
      expect(called).to.equal(true);
    });

    it('getMatchingListeners returns empty array for symbols', () => {
      const symbolEvent = Symbol('test');
      emitter.on(symbolEvent, () => {});

      // Access private method - symbols don't support pattern matching
      const result = (emitter as any).getMatchingListeners(symbolEvent);
      expect(result).to.be.instanceOf(Array);
      expect(result.length).to.equal(0);
    });
  });

  describe('sorted insertion optimization', () => {
    it('maintains correct order when listeners are added in mixed order', () => {
      const results: string[] = [];

      // Add listeners normally
      emitter.on(/test/, () => {
        results.push('first');
      });
      emitter.on(/test/, () => {
        results.push('second');
      });
      emitter.on(/test/, () => {
        results.push('third');
      });

      emitter.emit('test');

      expect(results).to.eql(['first', 'second', 'third']);
    });

    it('inserts listener in correct position when idx is smaller (edge case)', () => {
      const results: number[] = [];
      const pattern = /^edge/;

      // Save the current global index
      const PatternEmitterClass = emitter.constructor as any;
      const originalIndex = PatternEmitterClass._globalListenerIndex;

      // Add first listener with high idx
      emitter.on(pattern, () => {
        results.push(2);
      });

      // Manually decrease global index to simulate out-of-order insertion
      PatternEmitterClass._globalListenerIndex = originalIndex - 100;

      // Add listener with artificially low idx - this triggers lines 193-194
      emitter.on(pattern, () => {
        results.push(1);
      });

      // Restore global index
      PatternEmitterClass._globalListenerIndex = originalIndex + 1;

      // Add third listener
      emitter.on(pattern, () => {
        results.push(3);
      });

      // Emit and verify correct order
      emitter.emit('edge-case');
      expect(results).to.eql([1, 2, 3]);

      // Restore to a safe value
      PatternEmitterClass._globalListenerIndex = originalIndex + 100;
    });
  });

  describe('removeListener edge cases', () => {
    it('keeps pattern when removing one listener but others remain', () => {
      const pattern = /^multi/;
      const listener1 = () => {};
      const listener2 = () => {};
      const listener3 = () => {};

      emitter.on(pattern, listener1);
      emitter.on(pattern, listener2);
      emitter.on(pattern, listener3);

      // Remove the middle listener
      emitter.removeListener(pattern, listener2);

      const listeners = (emitter as any)._listeners;
      const patternKey = String(pattern);
      const remainingListeners = listeners.get(patternKey);

      // Pattern should still exist with 2 listeners
      expect(remainingListeners).to.be.instanceOf(Array);
      expect(remainingListeners.length).to.equal(2);

      // Verify it still works
      let count = 0;
      const testListener = () => {
        count++;
      };
      emitter.on(pattern, testListener);
      emitter.emit('multi-test');
      expect(count).to.equal(1);
    });
  });

  describe('max listeners', () => {
    it('setMaxListeners sets the maximum number of listeners', () => {
      const result = emitter.setMaxListeners(20);
      expect(result).to.equal(emitter); // Should return this for chaining
    });

    it('getMaxListeners returns the maximum number of listeners', () => {
      emitter.setMaxListeners(25);
      const max = emitter.getMaxListeners();
      expect(max).to.equal(25);
    });
  });

  describe('eventNames', () => {
    it('should return empty array when no listeners are registered', () => {
      const names = emitter.eventNames();
      expect(names).to.be.an('array');
      expect(names).to.have.lengthOf(0);
    });

    it('should return string event names', () => {
      emitter.on('test.event', () => {});
      emitter.on('another.event', () => {});
      
      const names = emitter.eventNames();
      expect(names).to.have.lengthOf(2);
      expect(names).to.include('test.event');
      expect(names).to.include('another.event');
    });

    it('should return symbol event names', () => {
      const sym1 = Symbol('test');
      const sym2 = Symbol('another');
      
      emitter.on(sym1, () => {});
      emitter.on(sym2, () => {});
      
      const names = emitter.eventNames();
      expect(names).to.have.lengthOf(2);
      expect(names).to.include(sym1);
      expect(names).to.include(sym2);
    });

    it('should NOT include RegExp patterns in eventNames', () => {
      emitter.on('string.event', () => {});
      emitter.on(/test.*/, () => {});
      emitter.on(/another.*/, () => {});
      
      const names = emitter.eventNames();
      expect(names).to.have.lengthOf(1);
      expect(names).to.include('string.event');
    });

    it('should update when listeners are added', () => {
      expect(emitter.eventNames()).to.have.lengthOf(0);
      
      emitter.on('event1', () => {});
      expect(emitter.eventNames()).to.have.lengthOf(1);
      
      emitter.on('event2', () => {});
      expect(emitter.eventNames()).to.have.lengthOf(2);
    });

    it('should update when listeners are removed', () => {
      const handler1 = () => {};
      const handler2 = () => {};
      
      emitter.on('event1', handler1);
      emitter.on('event2', handler2);
      expect(emitter.eventNames()).to.have.lengthOf(2);
      
      emitter.off('event1', handler1);
      expect(emitter.eventNames()).to.have.lengthOf(1);
      expect(emitter.eventNames()).to.include('event2');
    });

    it('should update when all listeners are removed', () => {
      emitter.on('event1', () => {});
      emitter.on('event2', () => {});
      expect(emitter.eventNames()).to.have.lengthOf(2);
      
      emitter.removeAllListeners();
      expect(emitter.eventNames()).to.have.lengthOf(0);
    });

    it('should handle multiple listeners on same event', () => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      
      const names = emitter.eventNames();
      expect(names).to.have.lengthOf(1);
      expect(names[0]).to.equal('test');
    });
  });

  describe('eventPatterns', () => {
    it('should return empty array when no patterns are registered', () => {
      const patterns = emitter.eventPatterns();
      expect(patterns).to.be.an('array');
      expect(patterns).to.have.lengthOf(0);
    });

    it('should return RegExp pattern strings', () => {
      emitter.on(/test.*/, () => {});
      emitter.on(/another.*/, () => {});
      
      const patterns = emitter.eventPatterns();
      expect(patterns).to.have.lengthOf(2);
      expect(patterns).to.include('/test.*/');
      expect(patterns).to.include('/another.*/');
    });

    it('should NOT include string events in eventPatterns', () => {
      emitter.on('string.event', () => {});
      emitter.on(/test.*/, () => {});
      emitter.on(/another.*/, () => {});
      
      const patterns = emitter.eventPatterns();
      expect(patterns).to.have.lengthOf(2);
      expect(patterns).to.not.include('string.event');
    });

    it('should update when patterns are added', () => {
      expect(emitter.eventPatterns()).to.have.lengthOf(0);
      
      emitter.on(/pattern1.*/, () => {});
      expect(emitter.eventPatterns()).to.have.lengthOf(1);
      
      emitter.on(/pattern2.*/, () => {});
      expect(emitter.eventPatterns()).to.have.lengthOf(2);
    });

    it('should update when patterns are removed', () => {
      const handler1 = () => {};
      const handler2 = () => {};
      
      emitter.on(/pattern1.*/, handler1);
      emitter.on(/pattern2.*/, handler2);
      expect(emitter.eventPatterns()).to.have.lengthOf(2);
      
      emitter.off(/pattern1.*/, handler1);
      expect(emitter.eventPatterns()).to.have.lengthOf(1);
      expect(emitter.eventPatterns()).to.include('/pattern2.*/');
    });

    it('should update when all listeners are removed', () => {
      emitter.on(/pattern1.*/, () => {});
      emitter.on(/pattern2.*/, () => {});
      expect(emitter.eventPatterns()).to.have.lengthOf(2);
      
      emitter.removeAllListeners();
      expect(emitter.eventPatterns()).to.have.lengthOf(0);
    });

    it('should handle multiple listeners on same pattern', () => {
      emitter.on(/test.*/, () => {});
      emitter.on(/test.*/, () => {});
      emitter.on(/test.*/, () => {});
      
      const patterns = emitter.eventPatterns();
      expect(patterns).to.have.lengthOf(1);
      expect(patterns[0]).to.equal('/test.*/');
    });

    it('should remove pattern when last listener is removed', () => {
      const handler1 = () => {};
      const handler2 = () => {};
      const handler3 = () => {};
      
      emitter.on(/test.*/, handler1);
      emitter.on(/test.*/, handler2);
      emitter.on(/test.*/, handler3);
      expect(emitter.eventPatterns()).to.have.lengthOf(1);
      
      emitter.off(/test.*/, handler1);
      expect(emitter.eventPatterns()).to.have.lengthOf(1);
      
      emitter.off(/test.*/, handler2);
      expect(emitter.eventPatterns()).to.have.lengthOf(1);
      
      emitter.off(/test.*/, handler3);
      expect(emitter.eventPatterns()).to.have.lengthOf(0);
    });
  });

  describe('eventNames and eventPatterns together', () => {
    it('should return both string events and patterns separately', () => {
      emitter.on('string.event1', () => {});
      emitter.on('string.event2', () => {});
      emitter.on(/pattern1.*/, () => {});
      emitter.on(/pattern2.*/, () => {});
      
      const names = emitter.eventNames();
      const patterns = emitter.eventPatterns();
      
      expect(names).to.have.lengthOf(2);
      expect(patterns).to.have.lengthOf(2);
      
      expect(names).to.include('string.event1');
      expect(names).to.include('string.event2');
      expect(patterns).to.include('/pattern1.*/');
      expect(patterns).to.include('/pattern2.*/');
    });

    it('should allow iterating over all handlers using both methods', () => {
      const stringHandler1 = () => {};
      const stringHandler2 = () => {};
      const patternHandler1 = () => {};
      const patternHandler2 = () => {};
      
      emitter.on('event1', stringHandler1);
      emitter.on('event2', stringHandler2);
      emitter.on(/test.*/, patternHandler1);
      emitter.on(/another.*/, patternHandler2);
      
      // Get counts using public API
      const stringEvents = emitter.eventNames();
      const patterns = emitter.eventPatterns();
      
      expect(stringEvents).to.have.lengthOf(2);
      expect(patterns).to.have.lengthOf(2);
      
      // Verify we can access listener count for string events
      expect(emitter.listenerCount('event1')).to.equal(1);
      expect(emitter.listenerCount('event2')).to.equal(1);
      
      // Verify we can access all listeners via the unified map
      const allListeners = emitter.allListeners;
      expect(allListeners.has('event1')).to.be.true;
      expect(allListeners.has('event2')).to.be.true;
      expect(allListeners.has('/test.*/')).to.be.true;
      expect(allListeners.has('/another.*/')).to.be.true;
    });

    it('should handle complex scenario with mixed events', () => {
      const sym = Symbol('test');
      
      emitter.on('string1', () => {});
      emitter.on('string2', () => {});
      emitter.on(sym, () => {});
      emitter.on(/pattern1.*/, () => {});
      emitter.on(/pattern2.*/, () => {});
      
      const names = emitter.eventNames();
      const patterns = emitter.eventPatterns();
      
      // Should have 3 string/symbol events
      expect(names).to.have.lengthOf(3);
      expect(names).to.include('string1');
      expect(names).to.include('string2');
      expect(names).to.include(sym);
      
      // Should have 2 patterns
      expect(patterns).to.have.lengthOf(2);
      expect(patterns).to.include('/pattern1.*/');
      expect(patterns).to.include('/pattern2.*/');
    });
  });
});
