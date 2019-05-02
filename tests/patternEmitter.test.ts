import { PatternEmitter } from '../src';
import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('PatternEmitter', () => {
  let emitter: PatternEmitter;
  beforeEach(() => {
    emitter = new PatternEmitter();
  });

  describe('emit', () => {
    it('returns false if no listeners match the event', function() {
      let invoked = false;

      emitter.on(/^t.*/, () => {
        invoked = true;
      });

      emitter.on('invalid', () => {
        invoked = true;
      });

      let result = emitter.emit('noMatch');

      expect(invoked).to.equal(false);
      expect(result).to.equal(false);
    });

    it('returns true if a listener matches the event', () => {
      emitter.on('test', () => {});
      let result = emitter.emit('test');

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
      emitter.on('hi::1', () => {
        invokedCount++;
      });
      emitter.on('hi::2', () => {});
  
      emitter.emit('hi::1', 'emitted');
  
      expect(invokedCount).to.equal(2);
    });

    it('invokes the listener with any additional arguments', () => {
      let args;
      emitter.on(/^t\w{3}/, (arg1, arg2, arg3) =>  {
        args = [arg1, arg2, arg3];
      });

      emitter.emit('test', 'arg1', 'arg2', 'arg3');

      expect(args).to.eql(['arg1', 'arg2', 'arg3']);
    });

    it('invokes all matching listeners', () =>  {
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

  describe('once', function() {
    it('adds a listener that can be invoked at most once', () => {
    });
  });
 
  describe('addListener', () => {

  });

  
});
