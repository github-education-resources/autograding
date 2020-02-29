import path from 'path'
import * as core from '@actions/core'
import {run, runAll, TestComparison} from '../runner'

beforeEach(() => {
  // resetModules allows you to safely change the environment and mock imports
  // separately in each of your tests
  jest.resetModules()
  jest.restoreAllMocks()
  jest.spyOn(core, 'setOutput').mockImplementation(() => {
    return
  })
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
      timeout: 1,
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
      timeout: 1,
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
      timeout: 1,
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
      timeout: 1,
    }

    await expect(run(test, cwd)).rejects.toThrow('The output for test Hello Test did not match')
  }, 10000)

  it('can read shell output', async () => {
    const cwd = path.resolve(__dirname, 'shell')
    const test = {
      name: 'Hello Test',
      setup: '',
      run: 'sh hello.sh',
      input: 'Nathaniel',
      output: 'Hello Nathaniel',
      comparison: 'exact' as TestComparison,
      timeout: 1,
    }

    await expect(run(test, cwd)).resolves.not.toThrow()
  }, 10000)

  it('does not compare when there is no expected input and no expected output', async () => {
    const cwd = path.resolve(__dirname, 'shell')
    const test = {
      name: 'Hello Test',
      setup: '',
      run: 'sh hello.sh',
      input: undefined,
      output: undefined,
      comparison: 'exact' as TestComparison,
      timeout: 1,
    }

    await expect(run(test, cwd)).resolves.not.toThrow()
  }, 10000)

  it('prints the stdout and stdin', async () => {
    const stdoutSpy = jest.spyOn(process.stdout, 'write')

    const cwd = path.resolve(__dirname, 'shell')
    const test = {
      name: 'Hello Test',
      setup: '',
      run: 'sh hello.sh',
      input: undefined,
      output: undefined,
      comparison: 'exact' as TestComparison,
      timeout: 1,
    }

    await expect(run(test, cwd)).resolves.not.toThrow()

    expect(stdoutSpy).toHaveBeenCalledWith(
      // Hello Nathaniel\n
      Buffer.from([72, 101, 108, 108, 111, 32, 78, 97, 116, 104, 97, 110, 105, 101, 108, 10]),
    )
  }, 10000)
})

describe('runAll', () => {
  it('counts the points', async () => {
    const cwd = path.resolve(__dirname, 'shell')
    const tests = [
      {
        name: 'Hello Test',
        setup: '',
        run: 'sh hello.sh',
        input: undefined,
        output: undefined,
        comparison: 'exact' as TestComparison,
        timeout: 1,
        points: 7,
      },
    ]

    // Expect the points to be in the output
    const setOutputSpy = jest.spyOn(core, 'setOutput')
    await expect(runAll(tests, cwd)).resolves.not.toThrow()
    expect(setOutputSpy).toHaveBeenCalledWith('Points', '7/7')
  }, 10000)
})
