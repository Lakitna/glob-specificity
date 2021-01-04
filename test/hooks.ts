/* eslint-disable mocha/no-top-level-hooks */
/* eslint-disable mocha/no-hooks-for-single-case */

import sinon from 'sinon';

afterEach(function() {
    sinon.restore();
});
