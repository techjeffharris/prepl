prepl
=====

Programmatic Read Eval Print Loop

```javascript
var repl = require('prepl')();

repl.start();
```

Use [nc](http://en.wikipedia.org/wiki/Netcat) to connect:

    $ nc -u prepl.sock
    > help
        COMMAND     DESCRIPTION
        help        Display this help message
        exit        Disconnect from REPL
    > exit
    $ 

## Configuration
Default configuration:
```json
{
    "name": "prepl",
    "socket": "prepl.sock"
}
```

### Options
* `name`: name of the application using prepl.  Default: `prepl`.
* `socket`: path to the socket to be used.  Default: `prepl.sock`.  See [net](http://nodejs.org/api/net.html).[Server](http://nodejs.org/api/net.html#net_class_net_server).[listen(path, [callback])](http://nodejs.org/api/net.html#net_server_listen_path_callback)
* `address`: IP address to which the net server will bind.  Default `undefined`.  See [net](http://nodejs.org/api/net.html).[Server](http://nodejs.org/api/net.html#net_class_net_server).[listen(port, [host], [backlog], [callback])](http://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback)
* `port`: the TCP port to which the net server will bind.  Default `undefined`.  See [net](http://nodejs.org/api/net.html).[Server](http://nodejs.org/api/net.html#net_class_net_server).[listen(port, [host], [backlog], [callback])](http://nodejs.org/api/net.html#net_server_listen_port_host_backlog_callback)

## API

### Prepl
Exposed by `require('prepl')`.

### Prepl()
Creates a new `Prepl`.  Works with and without `new`:

```javascript
var prepl = require('prepl')();
  // or
var Prepl = require('prepl');
var repl = new Prepl();
```

### Prepl(options:Object)

Optionally, the first argument of the Server constructor may be an options object to be passed to [Prepl.configure](#preplconfigureoptionsobject).

### Prepl.configure(options:Object)
* options `Object` A hash of options to override defaults

Configure the REPL:

```javascript
repl.configure({
    address: '0.0.0.0',
    port: 1338,
    socket: undefined
});
```

### Prepl.register(commands:Array)
* commands `Array` An array of commands to be registered

Registers the given commands with the REPL:

```javascript
repl.register([{
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
```

The command(s) will be now available and listed in the help menu:

    > help
        COMMAND     DESCRIPTION
        help        Display this help message
        exit        Disconnect from REPL
        start       Start the application
        restart     Restart the application
    > 

### Prepl.unregister(name:String)
* name `String` command to be unregistered
 
Unregister the given action:

```javascript
repl.unregister('start');
```

The command will no longer be available or listen in the help menu:

    > help
        COMMAND     DESCRIPTION
        help        Display this help message
        exit        Disconnect from REPL
        restart     Restart the application
    >

### Prepl.start(done:Function)
* done `Function` Optional callback to be called when REPL has started

Start the REPL:
```javascript
repl.start(function () {
    console.log('the REPL server is now ready!');
})
```

### Prepl.stop(done:Function)
* done `Function` Optional callback to be called when REPL has stopped

Stop the REPL:
```javascript
repl.stop(function () {
    console.log('the REPL server has now stopped!');
})
```

## Events

### Event: 'starting'
Emitted before the REPL server starts:

```javascript
repl.on('starting', function onReplStarting () {
    console.log('starting REPL server...');
});
```

### Event: 'stopping'
Emitted before the REPL server stops:

```javascript
repl.on('stopping', function onReplStopping () {
    console.log('stopping REPL server...');
});
```

### Event: 'stopped'
Emitted once the REPL server has stopped:

```javascript
repl.on('stopped', function onReplStopped () {
    console.log('REPL server stopped!');
});
```

### Event: 'ready'
Emitted once the REPL server is ready:

```javascript
repl.on('ready', function onReplReady () {
    console.log('the REPL server is ready!');
});
```
