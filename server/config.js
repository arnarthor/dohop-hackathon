'use strict';

var pckg = require('../package.json');
exports.package = pckg;

exports.name = pckg.name;
exports.version = pckg.version;

try {
  var config = require('./config/config.json');
} catch (e) {
  console.error('Warning: No config configurations.', e);
  return process.exit(0);
}
Object.keys(config).forEach(function (key) {
  exports[key] = config[key];
});

/*
 * Bunyan Logging
 * https://github.com/trentm/node-bunyan
 */
if (exports.bunyan && exports.bunyan.streams) {
  exports.bunyan.streams.forEach(function(output) {
    if (output.stream && output.stream === 'process.stdout') output.stream = process.stdout;
  });
} else if (!exports.bunyan) {
  exports.bunyan = {};
}
exports.bunyan.name = pckg.name;
