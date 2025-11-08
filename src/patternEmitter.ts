/**
 * @module PatternEmitter
 */

import {EventEmitter} from 'events';

import {EventPattern, PatternListener, EventEmitterType} from './types';

/**
 * Creates a new PatternEmitter, which extends EventEmitter. In addition to
 * EventEmitter's prototype, it allows listeners to register to events matching
 * a RegExp pattern.
 *
 * @extends EventEmitter
 *
 * @property {*} _globalListenerIndex global listener index allowing to call the handlers in the exact sequence
 */

export class PatternEmitter extends EventEmitter {
  public static _globalListenerIndex = 1;
  private static readonly EMPTY_LISTENERS: PatternListener[] = [];

  private _regexesCount: number = 0;

  /**
   * Map to store all the regex string and actual regex
   */
  private _regexMap: Map<string, RegExp>;

  /**
   * Map of the pattern listeners (RegExp patterns only)
   * String and symbol listeners are stored in the parent EventEmitter
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

  // Explicitly declare on and off to support EventPattern (including RegExp)
  public on!: (type: EventPattern, listener: PatternListener) => this;
  public off!: (type: EventPattern, listener: PatternListener) => this;

  constructor() {
    super(); // Call EventEmitter constructor

    this._regexMap = new Map<string, RegExp>();

    // Alias on and off to our overridden methods
    // These are inherited from EventEmitter but we reassign to ensure they use our overrides
    this.on = this.addListener;
    this.off = this.removeListener;
  }

  /**
   * Returns a Map containing ALL listeners (both string/symbol events and RegExp patterns).
   * This provides a unified view of all registered listeners.
   * This is a PatternEmitter-specific extension beyond standard EventEmitter.
   * @return {Map<EventPattern, PatternListener[]>} Map of all event patterns to their listeners
   */
  public get allListeners(): Map<EventPattern, PatternListener[]> {
    const allListeners = new Map<EventPattern, PatternListener[]>();

    // Add string/symbol events from parent EventEmitter
    const eventNames = super.eventNames();
    eventNames.forEach((eventName: EventEmitterType) => {
      const eventListeners = super.listeners(eventName);
      if (eventListeners.length > 0) {
        allListeners.set(eventName, eventListeners as PatternListener[]);
      }
    });

    // Add RegExp patterns from internal _listeners Map
    this._listeners.forEach((handlers, pattern) => {
      allListeners.set(pattern, handlers);
    });

    return allListeners;
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
      return super.emit(type, ...rest);
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
      // For string events, just wrap and delegate (no tracking needed)
      this.wrapListener(listener);
      return super.once(type, listener);
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
    // Invalidate cache when adding listeners
    this._clearListenerCache();

    if (!(type instanceof RegExp)) {
      // For string/symbol events, just attach idx and delegate to parent
      // No need to track in _actualListeners - they're modified in place
      this.wrapListener(listener);
      return super.addListener(type, listener);
    }

    // For RegExp patterns, wrap, track, and add to internal storage
    const wrappedListener = this.wrapListener(listener);
    this._actualListeners.set(wrappedListener, listener);

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
        if ((wrappedListener as any).idx < (typeListeners[i] as any).idx) {
          insertIndex = i;
          break;
        }
      }
      typeListeners.splice(insertIndex, 0, wrappedListener);
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

    if (!(type instanceof RegExp)) {
      // For string events, remove from parent
      // Don't remove from _actualListeners - it might be used for regex patterns too
      super.removeListener(type, listener);
      return this;
    }

    // For RegExp patterns, find the wrapped version
    let wrapedListener: PatternListener | undefined;
    for (const [wrapped, original] of this._actualListeners.entries()) {
      if (original === listener) {
        wrapedListener = wrapped;
        break;
      }
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
      super.removeAllListeners();
      this._listeners.clear();
      this._regexMap.clear();
      this._regexesCount = 0;
      this._actualListeners.clear(); // Clean up wrapped listeners
      return this;
    }

    if (!(type instanceof RegExp)) {
      // String event - just remove from parent (we don't track in _actualListeners)
      super.removeAllListeners(type);
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
   * Gets the listeners subscribed to the given event or pattern.
   * This method is enhanced from EventEmitter.listeners(event) to support RegExp patterns.
   * @param {EventPattern} event - The event type (string, symbol, or RegExp pattern)
   * @return {PatternListener[]} Array of listeners for the specific event/pattern
   */
  public listeners(event: EventPattern): PatternListener[] {
    if (event instanceof RegExp) {
      // For RegExp patterns, return the specific pattern's listeners
      return this.patternListeners(event);
    }
    // For string/symbol events, return only the direct listeners (not pattern matches)
    // This matches standard EventEmitter.listeners() behavior
    return super.listeners(event) as PatternListener[];
  }

  /**
   * Gets ALL listeners that would be invoked for the given event type (including pattern matches).
   * This is different from listeners() which returns only direct listeners.
   * @param {EventEmitterType} type - The event type (string or symbol)
   * @return {PatternListener[]} Array of all matching listeners (direct + pattern-matched)
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

    return listeners || PatternEmitter.EMPTY_LISTENERS;
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
      // regexp from Map<string, RegExp> is always RegExp, no need for instanceof check
      if (regexp.test(type)) {
        regexListeners.push(...this.patternListeners(regexp));
      }
    });

    // Collect string listeners (in insertion order = idx order)
    // Since we modify listeners in place (attach idx), the listener IS the wrapped version
    const stringListeners: PatternListener[] = super.listeners(
      type
    ) as PatternListener[];

    // Merge two sorted arrays by idx - O(n+m) instead of O((n+m)log(n+m))
    const wrappedListeners = this._mergeSortedListeners(
      regexListeners,
      stringListeners
    );

    // Unwrap regex listeners, but string listeners are already original (modified in place)
    const originalListeners: PatternListener[] = wrappedListeners.map(elem => {
      // Try to get original from _actualListeners (for regex patterns)
      const original = this._actualListeners.get(elem);
      // If not found, elem is a string listener (already original)
      return original !== undefined ? original : elem;
    });

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
    // Check if already wrapped (has idx) - don't wrap twice
    if ((listener as any).idx !== undefined) {
      return listener;
    }
    // Directly attach idx to listener - no closure needed!
    (listener as any).idx = PatternEmitter._globalListenerIndex++;
    return listener;
  }

  /**
   * Clears the listener cache
   * Called when listeners are added or removed
   * @private
   */
  private _clearListenerCache(): void {
    this._listenerCache.clear();
  }

  /**
   * Returns an array of all RegExp pattern strings registered with the emitter.
   * This does NOT include string/symbol events - use eventNames() for those.
   * @return {Array<string>} Array of RegExp pattern strings
   */
  public eventPatterns(): Array<string> {
    return Array.from(this._listeners.keys()) as string[];
  }
}
