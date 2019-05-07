/**
 * @module PatternEmitter
 */

import { EventEmitter } from 'events';

import { IPatternEmitter } from './interface';

import {
  EventEmitterType,
  EventPattern,
  EventEmitterInterfaceFunction,
  PatternListener,
  PatternEmitterInterfaceFunction,
} from './types';

/**
 * Creates a new PatternEmitter, which composites EventEmitter. In addition to
 * EventEmitter's prototype, it allows listeners to register to events matching
 * a RegExp.
 *
 * @constructor
 * @extends EventEmitter
 *
 * @property {*} _globalListenerIndex global listener index allowing to call the handlers in the exact sequence
 */

export class PatternEmitter implements IPatternEmitter {
  public static _globalListenerIndex = 1;
  private _emitter: EventEmitter;

  // ** for storing the default EventEmitter functionality
  private _addListener: EventEmitterInterfaceFunction;
  private _removeListener: EventEmitterInterfaceFunction;
  private _once: EventEmitterInterfaceFunction;
  /**
   * Private function stored native implementation for eventEmitter
   */
  private _emitterListeners: (type: EventEmitterType) => Function[];
  private _emit: (type: string | symbol, ...rest: any[]) => boolean;
  private _removeAllListeners: (type?: EventEmitterType) => EventEmitter;

  /**
   *  For optimizations
   *  @todo maybe we can use map length
   */
  private _regexesCount: number = 0;

  /**
   * Map to store all the regex string and actual regex
   */
  private _regexMap: Map<string, RegExp>;

  /**
   * Map of the pattern listeners
   * The string and symbol listeners are stored inside _emitter internal EventEmitter instance
   * @type {Map<EventPattern, PatternListener[]>}
   * @private
   */
  private _listeners: Map<EventPattern, PatternListener[]> = new Map<
    EventPattern,
    PatternListener[]
  >();

  // public addListener: PatternEmitterInterfaceFunction;
  // public removeListener: PatternEmitterInterfaceFunction;

  public on: PatternEmitterInterfaceFunction;
  public off: PatternEmitterInterfaceFunction;
  // @todo public prependListener: PatternEmitterInterfaceFunction;
  // @todo public prependOnceListener: PatternEmitterInterfaceFunction;

  constructor() {
    this._emitter = new EventEmitter();

    this._regexesCount = 0;
    this._listeners = new Map<EventPattern, PatternListener[]>();

    this._regexMap = new Map<string, RegExp>();

    this._emit = this._emitter.emit.bind(this);

    this._addListener = this._emitter.addListener.bind(this);
    this._removeListener = this._emitter.removeListener.bind(this);
    this._removeAllListeners = this._emitter.removeAllListeners.bind(this);
    this._once = this._emitter.once.bind(this);
    this._emitterListeners = this._emitter.listeners.bind(this);

    this.on = this.addListener;
    this.off = this.removeListener;
  }

  /**
   * Emits an event to all listeners for the specified type. In addition, if type
   * is a string, emits the event to all listeners whose patterns match. Returns
   * true if any listeners existed, false otherwise.
   * @param {EventEmitterType} type
   * @param {...*} rest - Arguments to apply when invoking the listeners
   * @return {boolean}
   */

  public emit(type: EventEmitterType, ...rest: any[]): boolean {
    // AVAR::NOTE Optimize for the case where no pattern listeners exit
    if (!this._regexesCount) {
      return this._emit(type, ...rest);
    }
    console.log('hereeee');

    const matchingListeners = this.getMatchingListeners(type);

    matchingListeners.forEach((listener: PatternListener) => {
      console.log('listener::::::::', listener);

      listener.bind(this)(...rest); //?????????????
    });

    console.log('matchingListeners.length:', matchingListeners.length);

    return matchingListeners.length > 0;
  }

  /**
   * Set the emitter once
   * @param {EventPattern} type
   * @param {PatternListener} listener
   */
  public once(type: EventPattern, listener: PatternListener) {
    /* ** the standart*/
    if (!(type instanceof RegExp)) {
      return this._once(type, this.wrapListener(listener));
    }

    const onceWrap = (type: EventPattern, listener: PatternListener) => {
      return (...rest: any[]) => {
        listener(...rest);

        this.removeListener(type, listener);
      };
    };

    return this.addListener(type, onceWrap(type, listener));
  }

  /**
   * Given a RegExp event type, stores the regular expression and registers the
   * listener to any events matching the pattern. Otherwise, it behaves exactly
   * as EventEmitter.
   * @param {EventPattern} type
   * @param {PatternListener} listener
   * @returns {PatternEmitter} This instance
   */
  public addListener(type: EventPattern, listener: PatternListener) {
    const wrapedListener = this.wrapListener(listener);
    // ** the standard
    if (!(type instanceof RegExp)) {
      return this._addListener(type, listener);
    }

    const regex: RegExp = type;
    // AVAR::NOTE string representation of the regexp
    const pattern: string = String(type);

    if (!this._regexMap.has(pattern)) {
      this._regexMap.set(pattern, regex);
    }

    // ** if there is no listener array registered than create one
    if (!this._listeners.has(pattern)) {
      this._listeners.set(pattern, new Array<PatternListener>());
    }

    // ** AVAR::TODO - can't be undefined
    const typeListenerd: PatternListener[] | undefined = this._listeners.get(
      pattern
    );

    // ** push the new listener under the right array
    if (typeListenerd) {
      typeListenerd.push(wrapedListener);
      this._regexesCount++;
    }

    console.log('this:', this);

    return this;
  }

  /**
   * Removes the listener from the specified event type. If given an instance of
   * RegExp, it matches any RegExp object with the same expression.
   * Returns an instance of itself.
   * @param {EventPattern} type
   * @param {PatternListener} listener
   * @return {PatternEmitter | EventEmitter}
   */
  public removeListener(type: EventPattern, listener: PatternListener) {
    const wrappedListener = this.wrapListener(listener);

    if (!(type instanceof RegExp)) {
        return this._removeListener(type, listener);
    }

    const regex: RegExp = type;
    // AVAR::NOTE string representation of the regexp
    const pattern: string = String(type);

    const matchingListenersArray = this._listeners.get(pattern);

    if (matchingListenersArray instanceof Array) {

      const arrWithRemovedListener = matchingListenersArray.filter(
        (value, index, arr) => {
          return value !== wrappedListener;
        }
      );
      this._listeners.set(pattern, arrWithRemovedListener);

      this._regexesCount--;
      if (this._regexesCount === 0) {
        this._regexMap.delete(pattern);
      }
    }
    return this;
  }

  /**
   * Removes all listeners for the specified event type. If given an instance of
   * RegExp, it matches the RegExp object with the same expression.
   * Returns an instance of itself.
   * @param {EventPattern} type
   * @return {any}
   */
  public removeAllListeners(type?: EventPattern) {
    if (!(type instanceof RegExp)) {
      this._removeAllListeners(type); //deleted return
    }
    if (type) {
      const pattern: string = String(type);
      if (this._listeners.has(pattern)) {
		this._listeners.delete(pattern);
        this._regexMap.delete(pattern);
        this._regexesCount--;
      }
    } else {	
		this._removeAllListeners();
		this._listeners.clear();
		this._regexMap.clear();
		this._regexesCount = 0;
    }
    return this;
  }

  /**
   * Returns an array of pattern listeners for the specified RegExp.
   * @param {RegExp} regex
   * @return {PatternListener[]}
   */
  public listeners(type: EventEmitterType): PatternListener[] {
    return this.getMatchingListeners(type);
  }

  /**
   * Returns the number of listeners for a given event. An alias for
   * EventEmitter's listenerCount.
   * @param {EventEmitterType} type
   * @return {number}
   */
  public listenerCount(type: EventEmitterType): number {
    return this.matchingListenerCount(type);
  }

  /**
   * Returns an array of pattern listeners for the specified RegExp.
   * @param {RegExp} regex
   * @return {PatternListener[]}
   */
  private patternListeners(regex: RegExp): PatternListener[] {
    /* @todo AVAR - do we need this check here ?*/

    if (!(regex instanceof RegExp)) {
      throw TypeError('pattern must be an instance of EventPattern');
    }

    const pattern: string = String(regex);

    const listeners = this._listeners.get(pattern);
    console.log('listeners>>>>>>>>>>', listeners);

    return listeners ? listeners : new Array<PatternListener>();
  }

  /**
   * Returns the number of listeners registered to the emitter for the specified
   * pattern.
   * @param {RegExp} regexp
   * @return {number}
   */
  private patternListenerCount(regexp: RegExp): number {
    const patternListeners = this.patternListeners(regexp);
    return patternListeners.length;
  }

  /**
   * Returns the number of listeners and pattern listeners registered to the
   * emitter for the event type or a matching pattern.
   * @param {EventPattern} type
   * @return {number} The number of listeners
   */
  private matchingListenerCount(type: EventEmitterType) {
    return this.getMatchingListeners(type).length;
  }
  /**
   * Returns all listeners for the given type, and if type is a string, matching pattern listeners.
   * @param {EventPattern} type - event type
   * @return {PatternListener[]}  All relevant listeners
   * @private
   */
  private getMatchingListeners(type: EventEmitterType) {
    console.log('type>>>>>>>', type);
    const matchingListeners = new Array<PatternListener>();
    if (typeof type === 'string') {
      this._regexMap.forEach((regexp: RegExp /* patternKey: string */) => {
        if (regexp && regexp instanceof RegExp) {
          console.log('regexp:::::', regexp);

          /**
           * Testing the type with the regexp
           */
          if (regexp.test(type)) {
            matchingListeners.push(...this.patternListeners(regexp));
            console.log('============>>>>', matchingListeners);
          }
        }
      });
      // ** AVAR::NOTE adding the string and symbol listeners
      // @todo review the type transformation

      matchingListeners.push(
        ...(this._emitterListeners(type) as PatternListener[])
      );
      console.log('============', matchingListeners);
    }

    /**
     * @todo maybe we should add index and sort listeners by index
     */
    return matchingListeners.sort((a: any, b: any) => {
      return a.idx - b.idx;
    });
  }

  private wrapListener(listener: PatternListener): PatternListener {
    const wrapedListener = (type: EventPattern, ...rest: any[]) => {
      listener(type, ...rest);
    };

    wrapedListener.idx = PatternEmitter._globalListenerIndex;
    PatternEmitter._globalListenerIndex++;
    return wrapedListener;
  }
}
