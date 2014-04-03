
var interrupt,
    Prepl = require('../index');

process.on('SIGINT', function () {

    if (interrupt === undefined) {
        console.log('\n(^C again to quit)'); 
        interrupt = setTimeout(function () {
            interrupt = undefined;
        }, 500);
    } else {
        prepl.stop(function() {
            console.log('prepl should be stopped');
            
        });
    }
});

var options = {
//     address: '0.0.0.0',
//     port: 1338,
//     socket: undefined
};

var prepl = new Prepl(options);

prepl.on('starting', function onReplStarting () {
    console.log('starting REPL server...');
});

prepl.on('stopping', function onReplStopping () {
    console.log('stopping REPL server...');
});

prepl.on('stopped', function onReplStopped () {
    console.log('REPL server stopped!');
});

prepl.on('ready', function onReplReady () {
    console.log('the REPL server is now ready!');
});

prepl.register([{
        name: "start",
        help: "Start the application",
        action: function () {
            console.log('cluster started');
        },
    },
    {
        name: "restart",
        help: "Restart the application",
        action: function () {
            console.log('cluster restarted');
        }
    }
]);

prepl.start(function () {
    console.log('the REPL server is _still_ ready!');
});

setTimeout(function () {

    prepl.unregister('start');
    console.log('unregistered "start"');
    
}, 5000);
