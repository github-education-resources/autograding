import path from 'path'
import {run, TestComparison} from '../runner'

beforeEach(() => {
  // resetModules allows you to safely change the environment and mock imports
  // separately in each of your tests
  jest.resetModules()
})

describe('runner', () => {
  // The most basic test is just checking that the run method doesn't throw an error.
  // This test relies on our default payload.
  it('runs', async () => {
    const cwd = path.resolve(__dirname, 'java')
    const test = {
      name: 'Hello Test',
      setup: 'javac Hello.java',
      run: 'java -cp . Hello',
      input: 'Jeff',
      output: 'Hello Jeff',
      comparison: 'included' as TestComparison,
      timeout: 5000,
    }

    await expect(run(test, cwd)).resolves.not.toThrow()

    // TODO: test running with no expected input, output
    // TODO: test TestError, TestTimeoutError, TestOutputError

    // await expect(run(test, cwd)).rejects.toEqual...
  }, 10000)
})
