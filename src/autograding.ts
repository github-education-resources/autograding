import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'
import {Test, runAll} from './runner'
import {setCheckRunOutput} from './output'

const run = async (): Promise<void> => {
  try {
    // try to get points inputs
    const points = core.getInput('points')
    const availablePoints = core.getInput('available-points')

    // if points inputs are present, set the output and call checkRun
    if (points && availablePoints) {
      core.info(`Using direct input points.`)
      const text = `Points ${points}/${availablePoints}`
      core.setOutput('Points', `${points}/${availablePoints}`)
      await setCheckRunOutput(text)
      return
    }

    // Otherwise, try to run the tests
    const cwd = process.env['GITHUB_WORKSPACE']
    if (!cwd) {
      throw new Error('No GITHUB_WORKSPACE')
    }

    const data = fs.readFileSync(path.resolve(cwd, '.github/classroom/autograding.json'))
    const json = JSON.parse(data.toString())

    await runAll(json.tests as Array<Test>, cwd)
  } catch (error) {
    // If there is any error we'll fail the action with the error message
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(`An unknown error occurred`)
    }
    core.setFailed(`Autograding failure: ${error}`)
  }
}

// Don't auto-execute in the test environment
if (process.env['NODE_ENV'] !== 'test') {
  run()
}

export default run
