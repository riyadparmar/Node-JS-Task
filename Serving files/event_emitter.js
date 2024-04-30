const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
    constructor() {
        super();
    }

    demoEventFunctions() {
        // Add listeners
        this.on('event', () => console.log('An event occurred!'));
        this.once('event', () => console.log('This will occur once'));
        this.on('event', () => console.log('Second listener for event'));

        // One-time listener prepended
        this.prependOnceListener('event', () => console.log('Prepended Once Listener'));

        // Add listener to the start
        this.prependListener('event', () => console.log('Prepended Listener'));
        this.addListener('anotherEvent', () => {});

        // Emit event
        this.emit('event');
        this.emit('event'); // Notice how the "once" listeners behave

        // Event names
        console.log('Event Names:', this.eventNames()); // Output: [ 'event', 'anotherEvent' ]

        // Listeners
        console.log('Listeners for "event":', this.listeners('event'));

        // Raw listeners
        console.log('Raw Listeners for "event":', this.rawListeners('event'));

        // Listener count
        console.log(`Listener count for "event": ${this.listenerCount('event')}`);

        // Get max listeners
        console.log('Max listeners:', this.getMaxListeners());

        // Set max listeners
        this.setMaxListeners(20);
        console.log('Updated max listeners:', this.getMaxListeners());

        // Remove specific listener
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
