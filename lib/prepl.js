
var events = require('events'),
    fs = require('fs'),
    net = require('net'),
    path = require('path'),
    repl = require('repl'),
    util = require('util'),
    utils = require('techjeffharris-utils');

module.exports = Prepl;

function Prepl(options) {

    // with or without new
    if (! (this instanceof Prepl) ) { b
        return new Prepl(options); 
    }

    var clients = [],
        config,
        defaults = {
            commands: [],
            name: "prepl",
            prompt: "> ",
            socket: "prepl.sock"
        },
        self = this,
        server,
        stdio;

    /**
     * Prepl#configure(options:Object):Boolean
     *
     * Set the configuration for the prepl
     * 
     */
    this.configure = function (options) {
        config = utils.extend(defaults, options);

        return true;
    };

    this.configure(options);

    server = net.createServer(function replOnConnection (client) {

        clients.push(client);

        client.on('end', function socketOnEnd () {
            clients.splice(clients.indexOf(client), 1);
        });

        var clientREPL = repl.start({
            prompt: config.prompt,
            input: client,
            output: client
        });

        addCommands(clientREPL);


    });

    server.on('listening', function serverListening () {

        var conn_str = (typeof config.socket === 'string') ? path.resolve(config.socket) : util.format('%s port %s', config.address, config.port);

        console.log('REPL server started: ' + conn_str);

        // starts arepl on stdio
        stdio = repl.start({
            prompt: config.prompt,
            input: process.stdin,
            output: process.stdout
        });

        addCommands(stdio);

        self.emit('ready');
    });

    server.on('error', function (e) {
        var options = {};

        if (e.code == 'EADDRINUSE') {

            if (config.socket) {
                options.path = config.socket;

                var clientSocket = new net.Socket();
                clientSocket.on('error', function(e) { // handle error trying to talk to server
                    if (e.code == 'ECONNREFUSED') {  // No other server listening
                        fs.unlink(config.socket);
                        server.listen(config.socket);
                    }
                });

                clientSocket.connect({path: config.socket}, function() { 
                    console.log('repl server running, giving up...');
                    process.exit();
                });
            } else {
                console.log('repl server running, giving up...');
                process.exit();
            }
        }
    });

    this.broadcast = function (message) {
        clients.forEach(function(client) {
            client.write(message + '\n' + config.prompt);
        });
    };

    
    /**
     * Prepl#start():Boolean
     *
     * Start the server
     */
    this.start = function (done) {
        this.emit('starting');

        // if socket path was defined, listen on that socket
        if (config.socket) {
            server.listen(config.socket);
        } 

        // otherwise, we'll use TCP port and address from config
        else {
            server.listen(config.port, config.address);
        }

        if (utils.getType(done) === 'function') {
            this.on('ready', done);
        }

        return true;
    };

    /**
     * Prepl#stop():Boolean
     *
     *  Stop the repl server
     */
    this.stop = function (done) {

        this.emit('stopping');

        if (utils.getType(done) === 'function') {
            this.on('stopped', done);
        }

        clients.forEach(function (client) {
            client.end('received shutdown signal!\n');
        });

        server.close(function () {
            self.emit('stopped');
        });

    };

    // add configured commands to the repl server instance
    function addCommands (repl_server) {
        config.commands.forEach(function (cmd) {
            repl_server.defineCommand(cmd.name, { help: cmd.help, action: cmd.action });
        });
    }
};

util.inherits(Prepl, events.EventEmitter);
