/**
 * @module IPatternEmitter
 */

import {EventEmitter} from 'events';

import {PatternEmitter} from './patternEmitter';

import {
  EventEmitterType,
  EventPattern,
  PatternListener,
  PatternEmitterInterfaceFunction,
} from './types';

export interface IPatternEmitter {
  // Returns ALL listeners (both string/symbol events and RegExp patterns) as a Map
  // This is a PatternEmitter-specific extension beyond standard EventEmitter
  readonly allListeners: Map<EventPattern, PatternListener[]>;

  addListener: PatternEmitterInterfaceFunction;
  removeListener: PatternEmitterInterfaceFunction;
  on: PatternEmitterInterfaceFunction;
  once: PatternEmitterInterfaceFunction;
  off: PatternEmitterInterfaceFunction;
  // @todo prependListener: PatternEmitterInterfaceFunction;
  // @todo prependOnceListener: PatternEmitterInterfaceFunction;

  removeAllListeners(type?: EventPattern): PatternEmitter | EventEmitter;
  listenerCount(type: EventPattern): number;

  setMaxListeners(n: number): PatternEmitter | EventEmitter;
  getMaxListeners(): number;

  // Enhanced EventEmitter-compatible method: returns listeners for a specific event or pattern
  // Accepts both string/symbol events AND RegExp patterns (PatternEmitter extension)
  listeners(event: EventPattern): PatternListener[];

  // Alias for listeners() with string/symbol events only - kept for backward compatibility
  listenersByEventType(event: EventEmitterType): PatternListener[];

  // @todo rawListeners(event: EventEmitterType): Function[];
  emit(event: EventEmitterType, ...args: any[]): boolean;

  eventNames(): Array<EventEmitterType>;
  eventPatterns(): Array<EventPattern>;
}
