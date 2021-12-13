const ErrorHandler = class ErrorHandler {

    poll = []

    constructor() { }

    message(log) {
        throw new Error(log);
    }
}

// process.on('uncaughtException', (err, origin) => {
//     console.log("ERR:", err);
//     process.exit(1)
// });

// process.on('SIGTERM', signal => {
//     console.log(`Process ${process.pid} received a SIGTERM signal`);
//     process.exit(0)
// });

// process.on('unhandledRejection', (reason, promise) => {
//     console.log('Unhandled rejection at ', promise, `reason: ${reason.message}`)
//     process.exit(1)
// })
// process.on('uncaughtException', (ex)=> { process.exit(0); });
// process.kill(process.pid, 'SIGABRT');

module.exports =  new ErrorHandler();