/**
 * @type {import("mocha").MochaOptions}
 */
const opts = {
    extension: ['ts'],
    recursive: true,
    require: ['choma'],
    spec: ['./test/**'],
    'node-option': ['loader=ts-node/esm', 'experimental-specifier-resolution=node'],
    'watch-files': ['./test/**/*.ts', './src/**/*.ts'],
};

module.exports = opts;
