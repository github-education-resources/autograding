import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'
import {Test, runAll} from './runner'

const run = async (): Promise<void> => {
  try {
    console.log('Preparing autograding')
    const cwd = process.env['GITHUB_WORKSPACE']
    if (!cwd) {
      throw new Error('No GITHUB_WORKSPACE')
    }

    console.log('Reading autograding test configuration')
    const data = fs.readFileSync(path.resolve(cwd, '.github/classroom/autograding.json'))
    const json = JSON.parse(data.toString())

    console.log('Running tests')
    await runAll(json.tests as Array<Test>, cwd)
  } catch (error) {
    // If there is any error we'll fail the action with the error message
    console.error(error.message)
    core.setFailed(`Autograding failure: ${error}`)
  }
}

// Don't auto-execute in the test environment
if (process.env['NODE_ENV'] !== 'test') {
  run()
}

export default run
