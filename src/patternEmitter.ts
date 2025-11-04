/**
 * @module PatternEmitter
 */

import {EventEmitter} from 'events';

import {IPatternEmitter} from './interface';

import {
  EventPattern,
  PatternListener,
  EventEmitterType,
  EventEmitterInterfaceFunction,
  PatternEmitterInterfaceFunction,
} from './types';

import {getByValue} from './utils';

/**
 * Creates a new PatternEmitter, which composites EventEmitter. In addition to
 * EventEmitter's prototype, it allows listeners to register to events matching
 * a RegExp.
 *
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
  private _actualListeners = new Map<PatternListener, PatternListener>();

  /**
   * Cache for getMatchingListeners() results
   * Key: event type (string or symbol)
   * Value: array of matching listeners
   * Invalidated when listeners are added/removed
   * @private
   */
  private _listenerCache = new Map<EventEmitterType, PatternListener[]>();

  public on: PatternEmitterInterfaceFunction;
  public off: PatternEmitterInterfaceFunction;

  constructor() {
    this._emitter = new EventEmitter();

    this._regexesCount = 0;
    this._listeners = new Map<EventPattern, PatternListener[]>();
    this._actualListeners = new Map<PatternListener, PatternListener>();
    this._listenerCache = new Map<EventEmitterType, PatternListener[]>();

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

  public get listeners() {
    return this._listeners;
  }

  /**
   * Set the maximum number of listeners for the emitter
   * @param n - Maximum number of listeners (0 = unlimited)
   */
  public setMaxListeners(n: number): this {
    this._emitter.setMaxListeners(n);
    return this;
  }

  /**
   * Get the maximum number of listeners for the emitter
   */
  public getMaxListeners(): number {
    return this._emitter.getMaxListeners();
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

    // Check cache first
    let matchingListeners = this._listenerCache.get(type);
    if (matchingListeners === undefined) {
      // Cache miss - compute and store
      matchingListeners = this.getMatchingListeners(type);
      this._listenerCache.set(type, matchingListeners);
    }

    matchingListeners.forEach((listener: PatternListener) => {
      listener.bind(this)(...rest);
    });

    return matchingListeners.length > 0;
  }

  /**
   * Set the emitter once
   * @param {EventPattern} type
   * @param {PatternListener} listener
   */
  public once(type: EventPattern, listener: PatternListener) {
    if (!(type instanceof RegExp)) {
      return this._once(type, this.wrapListener(listener));
    }

    const onceWrapper = (...rest: any[]) => {
      listener(...rest);
      this.removeListener(type, onceWrapper);
    };

    return this.addListener(type, onceWrapper);
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

    this._actualListeners.set(wrapedListener, listener);

    // Invalidate cache when adding listeners
    this._clearListenerCache();

    if (!(type instanceof RegExp)) {
      return this._addListener(type, listener);
    }

    const regex: RegExp = type;
    const pattern: string = String(type);

    if (!this._regexMap.has(pattern)) {
      this._regexMap.set(pattern, regex);
    }

    // ** if there is no listener array registered than create one
    if (!this._listeners.has(pattern)) {
      this._listeners.set(pattern, new Array<PatternListener>());
    }

    const typeListeners: PatternListener[] | undefined =
      this._listeners.get(pattern);

    // Insert listener in sorted position by idx to maintain order
    // This moves O(k log k) sort from emit path (hot) to add path (cold)
    if (typeListeners) {
      // Find insertion point using binary search
      let insertIndex = typeListeners.length;
      for (let i = 0; i < typeListeners.length; i++) {
        if ((wrapedListener as any).idx < (typeListeners[i] as any).idx) {
          insertIndex = i;
          break;
        }
      }
      typeListeners.splice(insertIndex, 0, wrapedListener);
      this._regexesCount++;
    }
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
    // Invalidate cache when removing listeners
    this._clearListenerCache();

    // Find the wrapped version of the listener
    let wrapedListener: PatternListener | undefined;

    // Search for the wrapped listener in _actualListeners
    for (const [wrapped, original] of this._actualListeners.entries()) {
      if (original === listener) {
        wrapedListener = wrapped;
        break;
      }
    }

    if (!(type instanceof RegExp)) {
      // For string events, remove from EventEmitter
      if (wrapedListener) {
        this._removeListener(type, wrapedListener);
        // Clean up the mapping
        this._actualListeners.delete(wrapedListener);
      }
      return this;
    }

    // For regex events
    const pattern: string = String(type);

    const matchingListenersArray = this._listeners.get(pattern);

    if (matchingListenersArray instanceof Array && wrapedListener) {
      const arrWithRemovedListener = matchingListenersArray.filter(value => {
        return value !== wrapedListener;
      });

      // Clean up the mapping
      this._actualListeners.delete(wrapedListener);

      // If no more listeners for this pattern, remove it entirely
      if (arrWithRemovedListener.length === 0) {
        this._listeners.delete(pattern);
        this._regexMap.delete(pattern);
      } else {
        this._listeners.set(pattern, arrWithRemovedListener);
      }

      this._regexesCount--;
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
    // Invalidate cache when removing all listeners
    this._clearListenerCache();

    if (!type) {
      // Remove ALL listeners - clean up everything
      this._removeAllListeners();
      this._listeners.clear();
      this._regexMap.clear();
      this._regexesCount = 0;
      this._actualListeners.clear(); // Clean up wrapped listeners
      return this;
    }

    if (!(type instanceof RegExp)) {
      // String event - remove from EventEmitter and clean up mappings
      const stringListeners = this._emitterListeners(type);
      // Find and remove wrapped listeners from _actualListeners
      for (const wrapped of stringListeners) {
        this._actualListeners.delete(wrapped as PatternListener);
      }
      this._removeAllListeners(type);
    } else {
      // Regex event - remove from internal storage
      const pattern: string = String(type);
      const patternListeners = this._listeners.get(pattern);
      if (patternListeners) {
        // Clean up wrapped listeners from _actualListeners
        for (const wrapped of patternListeners) {
          this._actualListeners.delete(wrapped);
        }
        this._listeners.delete(pattern);
        this._regexMap.delete(pattern);
        this._regexesCount--;
      }
    }
    return this;
  }

  /**
   * Returns an array of all listeners (including pattern listeners) for the specified event type.
   * @param {EventEmitterType} type - The event type (string or symbol)
   * @return {PatternListener[]} Array of all matching listeners
   */
  public listenersByEventType(type: EventEmitterType): PatternListener[] {
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
    if (!(regex instanceof RegExp)) {
      throw TypeError('pattern must be an instance of EventPattern');
    }

    const pattern: string = String(regex);

    const listeners = this._listeners.get(pattern);

    return listeners ? listeners : new Array<PatternListener>();
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
  private getMatchingListeners(type: EventEmitterType): PatternListener[] {
    if (typeof type !== 'string') {
      return [];
    }

    // Collect regex pattern listeners (already sorted by idx)
    const regexListeners: PatternListener[] = [];
    this._regexMap.forEach((regexp: RegExp) => {
      if (regexp && regexp instanceof RegExp && regexp.test(type)) {
        regexListeners.push(...this.patternListeners(regexp));
      }
    });

    // Collect string listeners (in insertion order = idx order)
    const stringListeners: PatternListener[] = [];
    this._emitterListeners(type).forEach(elem => {
      const wrapped = getByValue.bind(this)(this._actualListeners, elem);
      if (wrapped) {
        stringListeners.push(wrapped);
      }
    });

    // Merge two sorted arrays by idx - O(n+m) instead of O((n+m)log(n+m))
    const wrappedListeners = this._mergeSortedListeners(
      regexListeners,
      stringListeners
    );

    // Unwrap to get original listeners
    const originalListeners: PatternListener[] = wrappedListeners
      .map(elem => this._actualListeners.get(elem))
      .filter(
        (listener): listener is PatternListener => listener !== undefined
      );

    return originalListeners;
  }

  /**
   * Merges two sorted arrays of listeners by their idx property
   * O(n+m) complexity - faster than sort which is O((n+m)log(n+m))
   * @private
   */
  private _mergeSortedListeners(
    arr1: PatternListener[],
    arr2: PatternListener[]
  ): PatternListener[] {
    const result: PatternListener[] = [];
    let i = 0;
    let j = 0;

    while (i < arr1.length && j < arr2.length) {
      const idx1 = (arr1[i] as any).idx;
      const idx2 = (arr2[j] as any).idx;

      if (idx1 <= idx2) {
        result.push(arr1[i]);
        i++;
      } else {
        result.push(arr2[j]);
        j++;
      }
    }

    // Add remaining elements
    while (i < arr1.length) {
      result.push(arr1[i]);
      i++;
    }

    while (j < arr2.length) {
      result.push(arr2[j]);
      j++;
    }

    return result;
  }

  private wrapListener(listener: PatternListener): PatternListener {
    const wrapedListener = (type: EventPattern, ...rest: any[]) => {
      listener(type, ...rest);
    };

    wrapedListener.idx = PatternEmitter._globalListenerIndex;
    PatternEmitter._globalListenerIndex++;
    return wrapedListener;
  }

  /**
   * Clears the listener cache
   * Called when listeners are added or removed
   * @private
   */
  private _clearListenerCache(): void {
    this._listenerCache.clear();
  }
}
