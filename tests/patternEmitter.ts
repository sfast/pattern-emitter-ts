import { PatternEmitter } from '../src';
import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('PatternEmitter', () => {
  let emitter: PatternEmitter;
  beforeEach(() => {
    emitter = new PatternEmitter();
  });

  it('inherits listeners, once and setMaxListeners from EventEmitter', () => {
    const methods = ['_once'];
    // console.log('>>>>>>>>', PatternEmitter.prototype);

    // methods.forEach((method) => {
    //   expect(PatternEmitter.prototype[method]).to.be(EventEmitter.prototype[method]);
    // });
  });

  it('adds an event property to the invoked listener', function () {
    let event;
    emitter.on(/^\w{2}/, () => {
      event = this.event;
    });

    emitter.emit('test');

    expect(event).to.equal('test');
  });

  it('invokes a listener when the event matches its type', () => {
    let invoked = false;
    emitter.on('test', () => {
      invoked = true;
    });

    emitter.emit('test');

    expect(invoked).to.equal(true);
  });

  it('invokes a listener when the event matches with regexp', () => {
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
});
