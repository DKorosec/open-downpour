const arai2cTest = require('./aria2c');
// todo: those tests need some love, when time hook them up to some real testing framework (jest?)

console.log('running tests');
arai2cTest.forEach(test => test());
console.log('all tests completed');
