/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    packageManager: 'npm',
    reporters: ['html', 'progress'],
    checkers: ['typescript'],
    tsconfigFile: 'tsconfig.json',
    mochaOptions: {
        extension: ['ts'],
        require: [],
        spec: ['./test/**'],
    },
    testRunnerNodeArgs: ['--loader=ts-node/esm', '--experimental-specifier-resolution=node'],
    testRunner: 'mocha',
    coverageAnalysis: 'perTest',
};
export default config;
