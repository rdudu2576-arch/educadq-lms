import { EventEmitter } from "events";
export var eventBus = new EventEmitter();
// Aumentar limite de listeners para evitar warnings
eventBus.setMaxListeners(100);
