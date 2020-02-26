import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {WebhookPayload} from '@actions/github/lib/interfaces'
import nock from 'nock'
import run from '../autograding'

beforeEach(() => {
  // resetModules allows you to safely change the environment and mock imports
  // separately in each of your tests
  jest.resetModules()
  jest.restoreAllMocks()
  jest.spyOn(core, 'setOutput').mockImplementation(() => {
    return
  })
  jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
    if (name === 'token') return '12345'
    return ''
  })

  process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'java')
  process.env['GITHUB_REPOSITORY'] = 'example/repository'

  // Create a mock payload for our tests to use
  // https://developer.github.com/v3/activity/events/types/#issuecommentevent
  github.context.payload = {
    ref: 'refs/tags/simple-tag',
    before: '6113728f27ae82c7b1a177c8d03f9e96e0adf246',
    after: '0000000000000000000000000000000000000000',
    commits: [],
    repository: {
      id: 186853002,
      node_id: 'MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=',
      name: 'repository',
      full_name: 'example/repository',
      owner: {
        name: 'Codertocat',
        email: '21031067+Codertocat@users.noreply.github.com',
        login: 'Codertocat',
        id: 21031067,
      },
    },
  } as WebhookPayload
})

afterEach(() => {
  expect(nock.pendingMocks()).toEqual([])
  nock.isDone()
  nock.cleanAll()
})

describe('autograding action', () => {
  // The most basic test is just checking that the run method doesn't throw an error.
  // This test relies on our default payload.
  it('runs', async () => {
    await expect(run()).resolves.not.toThrow()
  }, 10000)

  // it('checks the protected files', async (): Promise<void> => {
  //   await run()
  // }, 10000)

  // it('executes the tests', async (): Promise<void> => {
  //   await run()
  // }, 10000)

  // it('executes passing input/output tests', async (): Promise<void> => {
  //   await run()
  // }, 10000)

  // it('executes failing input/output tests', async (): Promise<void> => {
  //   await run()
  // }, 10000)

  // it('creates feedback', async (): Promise<void> => {
  //   await run()
  // }, 10000)
})
