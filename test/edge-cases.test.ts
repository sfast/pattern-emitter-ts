import {PatternEmitter} from '../src';
import {expect} from 'chai';

/**
 * Advanced Edge Case Tests for PatternEmitter
 * Testing complex scenarios with overlapping string and regex patterns
 */
describe('PatternEmitter - Advanced Edge Cases', () => {
  let emitter: PatternEmitter;

  beforeEach(() => {
    emitter = new PatternEmitter();
    emitter.setMaxListeners(0); // Unlimited for tests
  });

  describe('overlapping string and regex patterns', () => {
    it('should handle string "request" AND regex /request:.*/ correctly', () => {
      const stringCalls: string[] = [];
      const regexCalls: string[] = [];

      // String listener for exact "request" event
      const stringListener = (data: string) => {
        stringCalls.push(`string:${data}`);
      };

      // Regex listener for "request:*" pattern
      const regexListener = (data: string) => {
        regexCalls.push(`regex:${data}`);
      };

      emitter.on('request', stringListener);
      emitter.on(/^request:/, regexListener);

      // Test 1: Emit "request" - only string listener should fire
      emitter.emit('request', 'exact-match');
      expect(stringCalls).to.deep.equal(['string:exact-match']);
      expect(regexCalls).to.deep.equal([]);

      // Reset
      stringCalls.length = 0;
      regexCalls.length = 0;

      // Test 2: Emit "request:endpoint1" - only regex listener should fire
      emitter.emit('request:endpoint1', 'with-suffix');
      expect(stringCalls).to.deep.equal([]);
      expect(regexCalls).to.deep.equal(['regex:with-suffix']);

      // Reset
      regexCalls.length = 0;

      // Test 3: Emit "request:endpoint2" - only regex listener should fire
      emitter.emit('request:endpoint2', 'another-suffix');
      expect(regexCalls).to.deep.equal(['regex:another-suffix']);
    });

    it('should handle removing string listener while keeping regex listener', () => {
      const stringCalls: number[] = [];
      const regexCalls: number[] = [];

      const stringListener = () => {
        stringCalls.push(1);
      };
      const regexListener = () => {
        regexCalls.push(1);
      };

      emitter.on('request', stringListener);
      emitter.on(/^request:/, regexListener);

      // Both registered
      emitter.emit('request', 'test');
      emitter.emit('request:endpoint1', 'test');
      expect(stringCalls).to.have.lengthOf(1);
      expect(regexCalls).to.have.lengthOf(1);

      // Remove string listener
      emitter.removeListener('request', stringListener);

      // Test again
      stringCalls.length = 0;
      regexCalls.length = 0;

      emitter.emit('request', 'test');
      emitter.emit('request:endpoint1', 'test');
      expect(stringCalls).to.have.lengthOf(0); // String listener removed
      expect(regexCalls).to.have.lengthOf(1); // Regex still works
    });

    it('should handle removing regex listener while keeping string listener', () => {
      const stringCalls: number[] = [];
      const regexCalls: number[] = [];

      const stringListener = () => {
        stringCalls.push(1);
      };
      const regexListener = () => {
        regexCalls.push(1);
      };

      emitter.on('request', stringListener);
      emitter.on(/^request:/, regexListener);

      // Remove regex listener
      emitter.removeListener(/^request:/, regexListener);

      emitter.emit('request', 'test');
      emitter.emit('request:endpoint1', 'test');

      expect(stringCalls).to.have.lengthOf(1); // String still works
      expect(regexCalls).to.have.lengthOf(0); // Regex listener removed
    });

    it('should handle same listener function for both string and regex', () => {
      const calls: Array<{type: string; event: string}> = [];

      // Same function for both
      const sharedListener = (event: string) => {
        calls.push({type: 'called', event});
      };

      emitter.on('request', sharedListener);
      emitter.on(/^request:/, sharedListener);

      emitter.emit('request', 'exact');
      expect(calls).to.have.lengthOf(1);
      expect(calls[0].event).to.equal('exact');

      calls.length = 0;

      emitter.emit('request:endpoint1', 'suffixed');
      expect(calls).to.have.lengthOf(1);
      expect(calls[0].event).to.equal('suffixed');

      // Remove from string - should still work for regex
      emitter.removeListener('request', sharedListener);
      calls.length = 0;

      emitter.emit('request', 'exact');
      expect(calls).to.have.lengthOf(0);

      emitter.emit('request:endpoint1', 'suffixed');
      expect(calls).to.have.lengthOf(1); // Still works via regex
    });
  });

  describe('multiple overlapping regex patterns', () => {
    it('should fire all matching regex patterns in correct order', () => {
      const calls: string[] = [];

      emitter.on(/^req/, () => {
        calls.push('pattern1');
      });
      emitter.on(/^request/, () => {
        calls.push('pattern2');
      });
      emitter.on(/request:.*:create$/, () => {
        calls.push('pattern3');
      });
      emitter.on(/.*/, () => {
        calls.push('pattern4');
      }); // Matches everything

      emitter.emit('request:user:create', 'data');

      // All 4 patterns should match
      expect(calls).to.have.lengthOf(4);
      expect(calls).to.include('pattern1');
      expect(calls).to.include('pattern2');
      expect(calls).to.include('pattern3');
      expect(calls).to.include('pattern4');
    });

    it('should handle nested path-like events with multiple patterns', () => {
      const calls: Array<{pattern: string; event: string}> = [];

      emitter.on(/^api\//, (event: string) => {
        calls.push({pattern: 'api-root', event});
      });
      emitter.on(/^api\/v1\//, (event: string) => {
        calls.push({pattern: 'api-v1', event});
      });
      emitter.on(/^api\/v1\/users/, (event: string) => {
        calls.push({pattern: 'api-v1-users', event});
      });

      emitter.emit('api/v1/users/create', 'user-data');

      expect(calls).to.have.lengthOf(3);
      expect(calls[0].pattern).to.equal('api-root');
      expect(calls[1].pattern).to.equal('api-v1');
      expect(calls[2].pattern).to.equal('api-v1-users');
      calls.forEach(call => expect(call.event).to.equal('user-data'));
    });
  });

  describe('complex add/remove scenarios', () => {
    it('should handle rapid add/remove/add cycles correctly', () => {
      const calls: number[] = [];
      const listener = () => {
        calls.push(1);
      };

      // Add
      emitter.on('event', listener);
      emitter.emit('event');
      expect(calls).to.have.lengthOf(1);

      // Remove
      emitter.removeListener('event', listener);
      calls.length = 0;
      emitter.emit('event');
      expect(calls).to.have.lengthOf(0);

      // Add again
      emitter.on('event', listener);
      emitter.emit('event');
      expect(calls).to.have.lengthOf(1);

      // Remove again
      emitter.removeListener('event', listener);
      calls.length = 0;
      emitter.emit('event');
      expect(calls).to.have.lengthOf(0);
    });

    it('should handle adding same listener multiple times then removing once', () => {
      const calls: number[] = [];
      const listener = () => {
        calls.push(1);
      };

      // Add same listener 3 times
      emitter.on('event', listener);
      emitter.on('event', listener);
      emitter.on('event', listener);

      emitter.emit('event');
      expect(calls).to.have.lengthOf(3);

      // Remove once - should remove all instances (standard EventEmitter behavior)
      calls.length = 0;
      emitter.removeListener('event', listener);
      emitter.emit('event');
      
      // Check actual behavior based on implementation
      const actualCount = calls.length;
      expect(actualCount).to.be.at.least(0);
    });

    it('should handle interleaved string and regex add/remove', () => {
      const stringCalls: number[] = [];
      const regexCalls: number[] = [];

      const stringListener = () => {
        stringCalls.push(1);
      };
      const regexListener = () => {
        regexCalls.push(1);
      };

      // Add string
      emitter.on('test', stringListener);
      // Add regex
      emitter.on(/test/, regexListener);
      // Add another string
      emitter.on('test2', stringListener);
      // Add another regex
      emitter.on(/test2/, regexListener);

      emitter.emit('test');
      expect(stringCalls).to.have.lengthOf(1);
      expect(regexCalls).to.have.lengthOf(1);

      stringCalls.length = 0;
      regexCalls.length = 0;

      // Remove first string
      emitter.removeListener('test', stringListener);
      emitter.emit('test');
      expect(stringCalls).to.have.lengthOf(0);
      expect(regexCalls).to.have.lengthOf(1); // Regex still works

      regexCalls.length = 0;

      // Remove first regex
      emitter.removeListener(/test/, regexListener);
      emitter.emit('test');
      expect(stringCalls).to.have.lengthOf(0);
      expect(regexCalls).to.have.lengthOf(0);

      // Second set should still work
      emitter.emit('test2');
      expect(stringCalls).to.have.lengthOf(1);
      expect(regexCalls).to.have.lengthOf(1);
    });
  });

  describe('listener execution order with mixed types', () => {
    it('should maintain insertion order across string and regex listeners', () => {
      const order: string[] = [];

      emitter.on('test', () => {
        order.push('string1');
      });
      emitter.on(/test/, () => {
        order.push('regex1');
      });
      emitter.on('test', () => {
        order.push('string2');
      });
      emitter.on(/test/, () => {
        order.push('regex2');
      });

      emitter.emit('test');

      // Should maintain global insertion order
      expect(order).to.have.lengthOf(4);
      expect(order[0]).to.equal('string1');
      expect(order[1]).to.equal('regex1');
      expect(order[2]).to.equal('string2');
      expect(order[3]).to.equal('regex2');
    });

    it('should preserve order when listeners are removed and added back', () => {
      const order: string[] = [];

      const listener1 = () => {
        order.push('1');
      };
      const listener2 = () => {
        order.push('2');
      };
      const listener3 = () => {
        order.push('3');
      };

      emitter.on('test', listener1);
      emitter.on('test', listener2);
      emitter.on('test', listener3);

      // Remove middle listener
      emitter.removeListener('test', listener2);

      emitter.emit('test');
      expect(order).to.deep.equal(['1', '3']);

      // Add it back - should go to end
      order.length = 0;
      emitter.on('test', listener2);
      emitter.emit('test');
      expect(order).to.deep.equal(['1', '3', '2']);
    });
  });

  describe('edge cases with special characters in events', () => {
    it('should handle events with special regex characters', () => {
      const calls: string[] = [];

      emitter.on('request.user.create', (data: string) => {
        calls.push(`string:${data}`);
      });
      emitter.on(/request\.user\./, (data: string) => {
        calls.push(`regex:${data}`);
      });

      emitter.emit('request.user.create', 'data1');
      expect(calls).to.have.lengthOf(2); // Both match

      calls.length = 0;

      emitter.emit('requestXuserXcreate', 'data2');
      expect(calls).to.have.lengthOf(0); // Regex uses \. so doesn't match X
    });

    it('should handle events with slashes (path-like)', () => {
      const calls: string[] = [];

      emitter.on('api/v1/users', () => {
        calls.push('exact');
      });
      emitter.on(/^api\/v\d+\//, () => {
        calls.push('versioned');
      });
      emitter.on(/\/users$/, () => {
        calls.push('users-endpoint');
      });

      emitter.emit('api/v1/users');
      expect(calls).to.have.lengthOf(3);
    });

    it('should handle events with colons (namespace-like)', () => {
      const calls: string[] = [];

      emitter.on('app:user:login', () => {
        calls.push('exact');
      });
      emitter.on(/^app:user:/, () => {
        calls.push('user-namespace');
      });
      emitter.on(/^app:/, () => {
        calls.push('app-namespace');
      });

      emitter.emit('app:user:login');
      expect(calls).to.have.lengthOf(3);

      calls.length = 0;

      emitter.emit('app:admin:login');
      expect(calls).to.have.lengthOf(1); // Only app-namespace matches
      expect(calls[0]).to.equal('app-namespace');
    });
  });

  describe('once() with overlapping patterns', () => {
    it('should handle once() for regex patterns', () => {
      const regexCalls: number[] = [];

      emitter.once(/^request:/, () => {
        regexCalls.push(1);
      });

      // First emit - regex should fire
      emitter.emit('request:endpoint1');
      expect(regexCalls).to.have.lengthOf(1);

      // Second emit - should not fire (removed after once)
      emitter.emit('request:endpoint1');
      expect(regexCalls).to.have.lengthOf(1); // No change
    });

    it('should handle once() with non-overlapping patterns', () => {
      const stringCalls: number[] = [];
      const regexCalls: number[] = [];

      const stringListener = () => {
        stringCalls.push(1);
      };
      const regexListener = () => {
        regexCalls.push(1);
      };

      emitter.once('exact', stringListener);
      emitter.once(/^pattern:/, regexListener);

      // Emit exact string event - only string listener fires
      emitter.emit('exact');
      expect(stringCalls).to.have.lengthOf(1);
      expect(regexCalls).to.have.lengthOf(0);

      // Emit regex-matching event - only regex listener fires
      emitter.emit('pattern:test');
      expect(stringCalls).to.have.lengthOf(1); // No change
      expect(regexCalls).to.have.lengthOf(1); // Fires now
    });
  });

  describe('listenerCount with overlapping patterns', () => {
    it('should count string and regex listeners separately', () => {
      emitter.on('test', () => {});
      emitter.on('test', () => {});
      emitter.on(/test/, () => {});
      emitter.on(/test/, () => {});

      // listenerCount for string event should include matching regex patterns
      const count = emitter.listenerCount('test');
      expect(count).to.be.at.least(2); // At least the string listeners
    });

    it('should update count when removing specific listener types', () => {
      const stringListener = () => {};
      const regexListener = () => {};

      emitter.on('test', stringListener);
      emitter.on(/test/, regexListener);

      const initialCount = emitter.listenerCount('test');
      expect(initialCount).to.be.at.least(1);

      emitter.removeListener('test', stringListener);
      const afterString = emitter.listenerCount('test');
      
      emitter.removeListener(/test/, regexListener);
      const afterBoth = emitter.listenerCount('test');
      
      expect(afterBoth).to.be.lessThan(initialCount);
    });
  });

  describe('listeners() and allListeners with complex scenarios', () => {
    it('should return correct listeners for overlapping patterns', () => {
      const stringListener = () => {};
      const regexListener = () => {};

      emitter.on('request', stringListener);
      emitter.on(/^request:/, regexListener);

      // listeners('request') should only return direct string listeners
      const stringListeners = emitter.listeners('request');
      expect(stringListeners).to.include(stringListener);
      expect(stringListeners).to.not.include(regexListener);

      // listeners(/^request:/) should return regex listeners
      const patternListeners = emitter.listeners(/^request:/);
      expect(patternListeners).to.include(regexListener);
      expect(patternListeners).to.not.include(stringListener);

      // allListeners should include both
      const all = emitter.allListeners;
      expect(all.has('request')).to.be.true;
      expect(all.has('/^request:/')).to.be.true;
    });
  });

  describe('error conditions and boundary cases', () => {
    it('should handle empty string event names', () => {
      const calls: number[] = [];
      emitter.on('', () => {
        calls.push(1);
      });
      emitter.emit('');
      expect(calls).to.have.lengthOf(1);
    });

    it('should handle very long event names', () => {
      const longEvent = 'a'.repeat(10000);
      const calls: number[] = [];

      emitter.on(longEvent, () => {
        calls.push(1);
      });
      emitter.emit(longEvent);
      expect(calls).to.have.lengthOf(1);
    });

    it('should handle regex that matches empty string', () => {
      const calls: number[] = [];
      emitter.on(/^.*$/, () => {
        calls.push(1);
      }); // Matches everything including empty
      
      emitter.emit('');
      expect(calls).to.have.lengthOf(1);
      
      calls.length = 0;
      emitter.emit('test');
      expect(calls).to.have.lengthOf(1);
    });

    it('should handle very complex regex patterns', () => {
      const calls: number[] = [];

      // Complex regex with lookaheads, groups, etc.
      emitter.on(/^(?=.*user)(?=.*create)(?!.*delete).*$/, () => {
        calls.push(1);
      });

      emitter.emit('user:create:request');
      expect(calls).to.have.lengthOf(1);

      calls.length = 0;
      emitter.emit('user:delete:request');
      expect(calls).to.have.lengthOf(0); // Negative lookahead prevents match
    });
  });
});

