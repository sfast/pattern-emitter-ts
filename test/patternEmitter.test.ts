import {PatternEmitter} from '../src';
import {expect} from 'chai';

describe('PatternEmitter', () => {
  let emitter: PatternEmitter;

  beforeEach(() => {
    emitter = new PatternEmitter();
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

  describe('listeners getter', () => {
    it('exposes the internal listeners map', () => {
      emitter.on(/test/, () => {});
      const listeners = emitter.listeners;
      expect(listeners).to.be.instanceOf(Map);
      expect(listeners.size).to.be.greaterThan(0);
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
});
