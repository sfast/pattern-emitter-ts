/**
 * @module Types
 */

import {EventEmitter} from "events";
import { PatternEmitter } from "./patternEmitter";

export type EventEmitterType = string | symbol;
export type EventPattern = RegExp | EventEmitterType;

/**
 * This is like the native declaration of emitter listener function
 */
export type PatternListener = (...args: any[]) => void;


export type EventInterfaceFunction = (event: string | symbol , listener: PatternListener) =>  EventEmitter;
export type PatternEventInterfaceFunction =  (event: EventPattern, listener: PatternListener) => PatternEmitter | EventEmitter;

export type EventEmitterInterfaceFunction = EventInterfaceFunction;
export type PatternEmitterInterfaceFunction =  PatternEventInterfaceFunction;
