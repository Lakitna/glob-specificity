/* eslint-disable mocha/no-top-level-hooks */
import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { afterEach } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

use(sinonChai);
use(chaiAsPromised);

afterEach(() => {
    // eslint-disable-next-line import/no-named-as-default-member
    sinon.restore();
});
