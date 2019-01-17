const testSetup = () => {
    const chai = require("chai");
    const chaiAsPromised = require('chai-as-promised');
    const deepEqualInAnyOrder = require('deep-equal-in-any-order');
    const sinonChai = require('sinon-chai');



    chai.use(chaiAsPromised);
    chai.use(deepEqualInAnyOrder);
    chai.use(sinonChai);
};

testSetup();
