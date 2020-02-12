import * as core from '@actions/core'
import * as github from '@actions/github'
import fs from 'fs'
import path from 'path'
import {Test, runAll} from './runner'

const run = async (): Promise<void> => {
  try {
    // Our action will need to API access the repository so we require a token
    // This will need to be set in the calling workflow, otherwise we'll exit
    console.log('Preparing autograding')
    const token = process.env['GITHUB_TOKEN'] || core.getInput('token')
    if (!token || token === '') return

    // Create the octokit client
    const octokit: github.GitHub = new github.GitHub(token)
    if (!octokit) return

    // The environment contains a variable for current repository. The repository
    // will be formatted as a name with owner (`nwo`); e.g., jeffrafter/example
    // We'll split this into two separate variables for later use
    // const nwo = process.env['GITHUB_REPOSITORY'] || '/'
    // const [owner, repo] = nwo.split('/')
    // if (!owner) return
    // if (!repo) return

    console.log('Preparing workspace')
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
