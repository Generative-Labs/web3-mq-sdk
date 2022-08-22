import { isValidEventType } from './events';
import { EventTypes } from '../types';
class EventEmitter {
  events: Record<string, any>;

  constructor() {
    this.events = {};
  }

  // 订阅
  on(eventName: EventTypes, callback: any) {
    const valid = isValidEventType(eventName);
    if (!valid) {
      throw Error(`Invalid event type ${eventName}`);
    }
    if (typeof callback == 'function') {
      const callbacks = this.events[eventName] || [];
      callbacks.push(callback);
      this.events[eventName] = callbacks;
    } else {
      throw new Error(`You need to add a callback method to the ${eventName} event`);
    }
  }

  // 触发
  emit(eventName: EventTypes, ...args: any[]) {
    const callbacks = this.events[eventName] || [];
    if (callbacks.length === 0) {
      throw new Error(`The ${eventName} event was not registered`);
    }
    callbacks.forEach((cb: any) => cb(...args));
  }

  // 取消订阅，
  off(eventName: EventTypes, callback: any) {
    if (callback === undefined) {
      this.events[eventName] = [];
      // throw new Error('The callback function is required');
    }
    const callbacks = this.events[eventName] || [];
    const newCallbacks = callbacks.filter(
      (fn: any) => fn != callback && fn.initialCallback != callback,
    );

    this.events[eventName] = newCallbacks;
  }

  once(eventName: EventTypes, callback: any) {
    if (callback === undefined) {
      throw new Error('The callback function is required');
    }
    const one = (...args: any[]) => {
      callback(...args);
      this.off(eventName, one);
    };
    one.initialCallback = callback;
    this.on(eventName, one);
  }
}

export default EventEmitter;
