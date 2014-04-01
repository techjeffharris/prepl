
var defaults = require('../config.default.json'),
    events = require('events'),
    fs = require('fs'),
    net = require('net'),
    path = require('path'),
    util = require('util'),
    utils = require('techjeffharris-utils');

module.exports = Prepl;

function Prepl(options) {

    // with or without new
    if (! (this instanceof Prepl) ) { 
        return new Prepl(options); 
    }

    var clients = [],
        commands = {
            names: [],
            actions: {},
            help: {}
        },
        config,
        self = this,
        server;

    var builtin = {
        names: ['help', 'exit'],
        help: {
            'help': 'Display this help message',
            'exit': 'Disconnect from REPL'
        },
        actions: {
            'help': replHelp,
            'exit': replExit
        }
    };

    server = net.createServer(function replOnConnection (socket) {

        clients.push(socket);

        socket.on('data', function socketOnData(chunk) {

            var name = chunk.toString().trim();

            // this is a builtin command
            if (isBuiltin(name)) {
                builtin.actions[name](socket);
                if (name === 'exit') {
                    return true;
                }
            }

            // or, if its a custom command
            else if (isRegistered(name)) { 
                commands.actions[name](socket);
            } 
            
            // otherwise, inform the user they're using a bad command
            else {
                socket.write(util.format("Err: unrecognized command: '%s'\n", name));
            }

            socket.write('> ');

            return true
            
        });

        socket.on('end', function socketOnEnd () {
            clients.splice(clients.indexOf(socket), 1);
        });

        socket.write('> ');

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

    server.on('listening', function serverListening () {

        var conn_str = (typeof config.socket === 'string') ? config.socket : util.format('%s port %s', config.address, config.port);

        console.log('REPL server started: ' + conn_str);
    });

    server.on('close', function serverOnClose () {
        console.log('the REPL server closed!');
    });

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

        this.emit('ready');

        return true;
    };

    /**
     * Prepl#register(newCommand:Object):Boolean
     *
     *  Register a command with the repl
     *
     * Prepl#register(newCommand:Array):Boolean
     *
     *  Register an list of commands with the repl
     */
    this.register = function (newCommand) {
        
        // if the first argument is an Array
        if (Array.isArray(newCommand)) {
            newCommand.forEach(addCommand);
        } 

        // or if the first argument is an Object literal
        else if (utils.getType(newCommand) === 'object') {
            addCommand(newCommand);
        }

        // otherwise, bad input was provided
        else {
            throw new Error("arg 0: must Object or Array of Objects!");
        }
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

    /*
     * Prepl#unregister(name:String):Boolean
     *
     *  Unregister a command specified by name
     */
    this.unregister = function (name) {

        if (isBuiltin(name)) {
            throw new Error('unregister: builtin commands may not be unregistered!');
            return false;
        }
        
        else if (isRegistered(name)) {
            return removeCommand(name);
        } else {
            throw new Error('unregister: command "' + name + '" not found!');
        }

    };

    
    function addCommand (cmd) {

        if (cmd.name.length > 15) {
            console.log('addCommand: command name may not exceed 15 characters!');
            return false;
        }

        if (isBuiltin(cmd.name)) {
            throw new Error('addCommand: builtin commands may not be modified!');
            return false
        }

        // if the command is already registered
        if (!isRegistered(cmd.name)) {
            commands.names.push(cmd.name);
        } 
        
        commands.help[cmd.name] = cmd.help,
        commands.actions[cmd.name] = cmd.action;

        return true;

    };


    function broadcast (message) {
        clients.forEach(function (socket) {
            socket.write('\n' + message + '\n> ');
        });
    };


    function isBuiltin (name) {
        return (builtin.names.indexOf(name) > -1 );
    }

    
    function isRegistered (name) { 
        return (commands.names.indexOf(name) > -1 );
    };
    

    function removeCommand (name) {

        if (isRegistered(name)) {

            var index = commands.names.indexOf(name);

            delete commands.names[index];
            delete commands.help[name];
            delete commands.actions[name];

            return true;
        } 

        else {
            return false;
        }

    };


    function replExit (socket) {
        socket.end();
    };

    function replHelp (socket) {

        var msg = ['\tCOMMAND\t\tDESCRIPTION\n'];

        builtin.names.forEach(function (name) {

            var tab = (name.length >= 8) ? '\t' : '\t\t';

            msg.push(util.format('\t%s%s%s\n', name.slice(0,14), tab, builtin.help[name]));

        });
        
        commands.names.forEach(function (name) {

            var tab = (name.length >= 8) ? '\t' : '\t\t';

            msg.push(util.format('\t%s%s%s\n', name.slice(0,14), tab, commands.help[name]));

        });

        socket.write(msg.join(''));

    };

    this.configure(options);

};

util.inherits(Prepl, events.EventEmitter);
