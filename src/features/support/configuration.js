let {defineSupportCode} = require('cucumber');

defineSupportCode(function({setDefaultTimeout}) {
    setDefaultTimeout(90 * 1000);
});