import {spawn} from 'child_process'

export const changedFiles = async (cwd: string): Promise<string> => {
  const command = 'git diff --name-only HEAD $(git rev-list --max-parents=0 HEAD)'
  const child = spawn(command, {
    cwd,
    shell: true,
    env: {
      PATH: process.env['PATH'],
    },
  })

  let output = ''

  child.stdout.on('data', chunk => {
    output += chunk
  })

  return new Promise((resolve, reject) => {
    child.once('exit', (code: number) => {
      if (code === 0) {
        resolve(output)
      } else {
        reject()
      }
    })
  })
}

export const check = async (): Promise<void> => {
  // list of files changed
  // get list of files we are protecting
  // see if any protected files have changed
    // if so fail build with error
    // if not continue build
  
  //return boolean on status 
  return
}