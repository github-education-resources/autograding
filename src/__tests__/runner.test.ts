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
  it('matches included output', async () => {
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
  }, 10000)

  it('matches regex output', async () => {
    const cwd = path.resolve(__dirname, 'java')
    const test = {
      name: 'Hello Test',
      setup: 'javac Hello.java',
      run: 'java -cp . Hello',
      input: 'Jeff',
      output: 'Jeff',
      comparison: 'regex' as TestComparison,
      timeout: 5000,
    }

    await expect(run(test, cwd)).resolves.not.toThrow()
  }, 10000)

  it('matches exact output', async () => {
    const cwd = path.resolve(__dirname, 'java')
    const test = {
      name: 'Hello Test',
      setup: 'javac Hello.java',
      run: 'java -cp . Hello',
      input: 'Jeff',
      output: 'What is your name?\nHello Jeff\n\n',
      comparison: 'exact' as TestComparison,
      timeout: 5000,
    }

    await expect(run(test, cwd)).resolves.not.toThrow()
  }, 10000)

  it('raises an error when output does not include the value', async () => {
    const cwd = path.resolve(__dirname, 'java')
    const test = {
      name: 'Hello Test',
      setup: 'javac Hello.java',
      run: 'java -cp . Hello',
      input: 'Jeff',
      output: 'Hello Mike',
      comparison: 'included' as TestComparison,
      timeout: 5000,
    }

    await expect(run(test, cwd)).rejects.toThrow('The output for test Hello Test did not match')
  }, 10000)
})
