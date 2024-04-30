const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
    constructor() {
        super();
    }

    demoEventFunctions() {
        this.on('event', () => console.log('An event occurred!'));
        this.once('event', () => console.log('This will occur once'));
        this.on('event', () => console.log('Second listener for event'));

        this.prependOnceListener('event', () => console.log('Prepended Once Listener'));

        this.prependListener('event', () => console.log('Prepended Listener'));
        this.addListener('anotherEvent', () => {});

        this.emit('event');
        this.emit('event'); // Once listener will get printed only once

        console.log('Event Names:', this.eventNames()); // Output: [ 'event', 'anotherEvent' ]

        console.log('Listeners for "event":', this.listeners('event'));

        console.log('Raw Listeners for "event":', this.rawListeners('event'));

        console.log(`Listener count for "event": ${this.listenerCount('event')}`);

        console.log('Max listeners:', this.getMaxListeners()); // Max listeners: 10
 
        this.setMaxListeners(20);
        console.log('Updated max listeners:', this.getMaxListeners()); // Updated max listeners: 20

        const callback = () => console.log('Callback not called');
        this.on('anotherEvent', callback);
        this.emit('anotherEvent');
        this.off('anotherEvent', callback);  // using off() method
        this.emit('anotherEvent'); // callback not called

        // Remove all listeners
        this.removeAllListeners('event');
        console.log('All listeners for "event" removed');
        this.emit('event'); // No output expected
    }
}

const myEmitter = new MyEmitter();
myEmitter.demoEventFunctions();
