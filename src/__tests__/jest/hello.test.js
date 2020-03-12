const hello = require('./hello');

test('outputs the correct string', () => {
  expect(hello()).toBe("Hello world!");
});