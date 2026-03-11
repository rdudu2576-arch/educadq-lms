import { EventEmitter } from "events";

export const eventBus = new EventEmitter();

// Aumentar limite de listeners para evitar warnings
eventBus.setMaxListeners(100);
