CHANGELOG
=========

## v1.2
### v1.2.0
* added `broadcast` method to send a message to all clients connected.
* updated `LICENSE` to BSD license rather than MIT to accurately reflect package.json

## v1.1
### v1.1.0
* `Prepl.register` now requires that the command's name length be 15 characters or less.
* fixed hang on `stop` by ending each client session with a shutdown message.
* help indents properly for command names with 8-15 characters.

## v1.0
### v1.0.4
* Fixed examples in README.md
  * moved configuration using IP and port to Prepl.configure example
  * updated connection example: added `-u` argument to `nc`

### v1.0.3
* removed extra newline after column headers in replHelp
* added use examples to README.md

### v1.0.2
* Updated README.md
* Created CHANGES.md

### v1.0.1
* added callback to [Prepl#stop](https://github.com/techjeffharris/prepl#stop)

### v1.0.0
* initial commit.
