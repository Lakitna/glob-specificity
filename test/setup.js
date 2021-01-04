/* eslint-disable @typescript-eslint/no-var-requires */

const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

require('ts-node').register({
    compilerOptions: {
        module: 'commonjs',
        outDir: './tmp',
        rootDir: './',
    },
});
