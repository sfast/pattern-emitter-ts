/**
 * @module IPatternEmitter
 */

import { EventEmitter } from "events";

import { PatternEmitter } from "./patternEmitter";

import {
  EventEmitterType,
  EventPattern,
  PatternListener,
  PatternEmitterInterfaceFunction,
} from "./types";

export interface IPatternEmitter {
  readonly listeners: Map<EventPattern, PatternListener[]>;
  
  addListener: PatternEmitterInterfaceFunction;
  removeListener: PatternEmitterInterfaceFunction;
  on: PatternEmitterInterfaceFunction;
  once: PatternEmitterInterfaceFunction;
  off: PatternEmitterInterfaceFunction;
  // @todo prependListener: PatternEmitterInterfaceFunction;
  // @todo prependOnceListener: PatternEmitterInterfaceFunction;

  removeAllListeners(type?: EventPattern): PatternEmitter | EventEmitter;
  listenerCount(type: EventPattern): number;

  // @todo setMaxListeners(n: number): PatternEmitter | EventEmitter;
  // getMaxListeners(): number;
  listenersByEventType(event: EventEmitterType): PatternListener[];
  // @todo rawListeners(event: EventEmitterType): Function[];
  emit(event: EventEmitterType, ...args: any[]): boolean;

  // @todo eventNames(): Array<EventEmitterType>;
  // @todo eventPatterns(): Array<EventPattern>;
}
