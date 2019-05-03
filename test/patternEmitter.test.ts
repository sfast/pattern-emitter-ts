import { PatternEmitter } from '../src';
import { EventEmitter } from 'events';
import { expect } from 'chai';
// import { stub } from 'sinon';
// import * as sinon from "ts-sinon";

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
      emitter.on('hi::1', () => {
        invokedCount++;
      });
      emitter.emit('hi::1', 'emitted');

      expect(invokedCount).to.equal(2);
    });

    it('invokes the listener with any additional arguments', () => {
      let allArgs;
      emitter.on(/^t\w{3}/, (...args) => {
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
    it('adds a listener that can be invoked at most once', () => {
      let counter = 0;
      const listener = () => {
        counter++;
      };

      emitter.once(/[a-z]/, listener);
      emitter.emit('test');
      emitter.emit('test');

      // how to test method which has private method or property in it and the testing functionality depends on that privates,
      // check
      // const stubObject = sinon.stubObject;
      // const testStub = stubObject<PatternEmitter>(emitter);
      // console.log(testStub._);

      // stub(PatternEmitter.prototype, <any>"_regexesCount")
      // let a = stub(PatternEmitter.prototype, <any>"_emit");
      // console.log(a("test").onFirstCall().returns(true));
      // console.log(emitter._regexesCount);
      expect(counter).to.equal(1);
    });
  });

  describe('addListener', () => {
    it("calls _addListener if type isn't a RegExp", () => {

    });
    it("adds type and its appropriate string(type) as a value to _regexMap map if type is a RegExp", () => {

    });
    it("adds type and listeners array as a value to _listeners map", () => { 

    });
    it('can add multiple listeners for the same pattern', () => { 

    });
  });

  describe('on', () => {
    it('is an alias for addListener', function() {
      expect(emitter.on).to.equal(emitter.addListener);
    });
  });

  describe('removeListener', () => {
    it("removes listener from _listeners map's appropriate pattern's array", () => {

    });
    it("removes the pattern _listeners map if that pattern has no other listeners", () => {

    });
    it("removes the listener from _events if type isn't a RegExp", () => { 

    });
  });

  describe('removeAllListeners', () => {
    it('removes all listeners for a given pattern from _listeners and removes the pattern from _regexMap if the type is given', () => {

    });
    it('clears _listeners and _regexMap maps if the type not given', () => {

    });
  });

  describe('listeners', () => {
    it('returns array of all listeners for the given pattern', () => {

    });
  });

  describe('listenerCount', () => {
    it('returns the count of listeners for given pattern', () => {

    });
  });

  describe('order', () => {
    it('calls matching listeners with order and listeners get data', () => {
      let arrOfDatas: any = []
      emitter.on(/^t.*'/, (data) => {
        arrOfDatas.push(`${data}:1`);
      });
      emitter.on(/^t\w{3}/, (data) => {
        arrOfDatas.push(`${data}:2`);
      });
      emitter.emit('test', "data");
      expect(arrOfDatas).to.equal(['data:1', 'data:2']);
    });
  });
});
