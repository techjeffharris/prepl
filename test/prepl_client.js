var net = require('net');
var replClient = net.connect({path: 'prepl.sock'}, function() {
    console.log('connected!');
});

replClient.on('data', function(data) {
    console.log(data.toString());
});

replClient.on('error', function (err) {
    console.log(err);
})

var commands = [
    'help\n',
    'kill\n',
    'status\n',
    'start\n', 
    'status\n'
];

for (var i = 0; i < commands.length; i++) {
    (function (command) {
        setTimeout(function() {
            replClient.write(command);
        }, i*2000);
    }(commands[i]));
}
