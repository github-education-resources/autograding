import {spawn, ChildProcess} from 'child_process'
import kill from 'tree-kill'
import * as core from '@actions/core'

export type TestComparison = 'exact' | 'included' | 'regex'

export interface Test {
  readonly name: string
  readonly setup: string
  readonly run: string
  readonly input?: string
  readonly output?: string
  readonly timeout: number
  readonly points?: number
  readonly comparison: TestComparison
}

export class TestError extends Error {
  constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, TestError)
  }
}

export class TestTimeoutError extends TestError {
  constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, TestTimeoutError)
  }
}

export class TestOutputError extends TestError {
  expected: string
  actual: string

  constructor(message: string, expected: string, actual: string) {
    super(`${message}\nExpected:\n${expected}\nActual:\n${actual}`)
    this.expected = expected
    this.actual = actual

    Error.captureStackTrace(this, TestOutputError)
  }
}

const normalizeLineEndings = (text: string): string => {
  return text.replace(/\r\n/gi, '\n').trim()
}

const waitForExit = async (child: ChildProcess, timeout: number): Promise<void> => {
  // eslint-disable-next-line no-undef
  return new Promise((resolve, reject) => {
    let timedOut = false
    let error: string | null = null

    const exitTimeout = setTimeout(() => {
      timedOut = true
      reject(new TestTimeoutError(`Setup timed out in ${timeout} milliseconds`))
      kill(child.pid)
    }, timeout)

    child.once('exit', (code: number, signal: string) => {
      if (timedOut) return
      clearTimeout(exitTimeout)

      if (error) {
        reject(new TestError(`Error: ${error}`))
      } else if (code === 0) {
        resolve(undefined)
      } else {
        reject(new TestError(`Error: Exit with code: ${code} and signal: ${signal}`))
      }
    })

    child.once('error', (error: Error) => {
      if (timedOut) return
      clearTimeout(exitTimeout)

      reject(error)
    })

    if (child.stderr) {
      // TODO: may need to generate an annotation here
      child.stderr.on('data', chunk => {
        if (error) error += '\r\n' + chunk
        else error = chunk
      })
    }
  })
}

const runSetup = async (test: Test, cwd: string, timeout: number): Promise<void> => {
  if (!test.setup || test.setup === '') {
    return
  }

  const setup = spawn(test.setup, {
    cwd,
    shell: true,
  })

  await waitForExit(setup, timeout)
}

const runCommand = async (test: Test, cwd: string, timeout: number): Promise<void> => {
  const child = spawn(test.run, {
    cwd,
    shell: true,
  })

  let output = ''

  child.stdout.on('data', chunk => {
    output += chunk + '\r\n'
  })

  // Preload the inputs
  if (test.input && test.input !== '') {
    child.stdin.write(test.input)
    child.stdin.end()
  }

  await waitForExit(child, timeout)

  // Eventually work off the the test type
  if ((!test.output || test.output == '') && (!test.input || test.input == '')) {
    return
  }

  const expected = normalizeLineEndings(test.output || '')
  const actual = normalizeLineEndings(output)

  switch (test.comparison) {
    case 'exact':
      if (actual != expected) {
        throw new TestOutputError(`The output for test ${test.name} did not match`, expected, actual)
      }
      break
    case 'regex':
      // Note: do not use expected here
      if (!actual.match(new RegExp(test.output || ''))) {
        throw new TestOutputError(`The output for test ${test.name} did not match`, test.output || '', actual)
      }
      break
    default:
      // The default comparison mode is 'included'
      if (!actual.includes(expected)) {
        throw new TestOutputError(`The output for test ${test.name} did not match`, expected, actual)
      }
      break
  }
}

export const run = async (test: Test, cwd: string): Promise<void> => {
  // Timeouts are in minutes, but need to be in ms
  let timeout = (test.timeout || 1) * 60 * 1000 || 30000
  const start = process.hrtime()
  await runSetup(test, cwd, timeout)
  const elapsed = process.hrtime(start)
  // Subtract the elapsed seconds (0) and nanoseconds (1) to find the remaining timeout
  timeout -= Math.floor(elapsed[0] * 1000 + elapsed[1] / 1000000)
  await runCommand(test, cwd, timeout)
}

export const runAll = async (tests: Array<Test>, cwd: string): Promise<void> => {
  let points = null
  let totalPoints = null

  console.log('Running all tests')
  for (const test of tests) {
    try {
      if (test.points) {
        totalPoints = totalPoints || 0
        totalPoints += test.points
      }
      console.log(`Running ${test.name}`)
      await run(test, cwd)
      console.log(`${test.name} Passed`)
      if (test.points) {
        points = points || 0
        points += test.points
      }
    } catch (error) {
      core.setFailed(error.message)
    }
  }
  // Set the number of points
  if (totalPoints) {
    console.log(`Points ${points}/${totalPoints}`)
    core.setOutput('Points', `${points}/${totalPoints}`)
  }
}
