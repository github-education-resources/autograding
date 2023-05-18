// Setup nock to disable all external calls
const nock = require('nock')
nock.disableNetConnect()

// By default, debug messages are written to the console which can make the test output confusing
// Instead, bind to stdout and hide all debug messages
const processStdoutWrite = process.stdout.write.bind(process.stdout)
process.stdout.write = (str, encoding, cb) => {
  return false
}

const processStderrWrite = process.stderr.write.bind(process.stderr)
process.stderr.write = (str, encoding, cb) => {
  if (str.toString().match(/Hello/)) return false
  processStderrWrite(str, encoding, cb)
}

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
}