import { isMainThread, parentPort } from "worker_threads"

const {
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_TOKEN
} = process.env

let status = 0 // 0 = available, 1 = busy, 2 = queued

const checkAllComplete = async () => {
  const workflowsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs`
  const response = await fetch( workflowsUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  } )
  const workflows = await response.json()
  const statuses = workflows.workflow_runs?.map( workflow => workflow.status ) || []
  const inProgressWorkflows = statuses.filter( d => d === "in_progress" || d === "queued" )

  return inProgressWorkflows.length ? false : true
}

const pollTillComplete = async () => {
  // Poll check all complete every 5 seconds
  // and return a promise that resolves when all are complete.

  return new Promise( ( resolve ) => {
    const interval = setInterval( async () => {
      const allComplete = await checkAllComplete()

      if ( allComplete ) {
        clearInterval( interval )
        resolve()
      }
    }, 5000 )
  } )
}

const triggerGitHubAction = async ( branch ) => {
  const branchOptions = ["main", "staging"]

  if ( !branchOptions.includes( branch ) ) {
    console.error( `Invalid branch: "${branch}"\nAborting.` )
    status = status > 0 ? status - 1 : 0
    parentPort.postMessage( {status, branch} )

    return
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/gen_static_files.yml/dispatches`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify( {
        ref: `${branch}`,
      } ),
    } )

    if ( response.ok ) {
      console.log( "GitHub Action triggered successfully." )
    } else {
      const errorBody = await response.json()
      throw new Error( errorBody.message )
    }
  } catch ( error ) {
    console.error( `Error: ${error.message}` )
  } finally {
    pollTillComplete().then( () => {
      if ( status === 2 ) triggerGitHubAction( branch )

      status = status > 0 ? status - 1 : 0
      parentPort.postMessage( {status, branch} )
    } )
  }
}

// Disallow it being called on the main thread--only as a worker.
if ( !isMainThread ) {
  // When script receives a message from parent.
  parentPort.on( "message", ( msg ) => {
    const { status: msgStatus, branch: msgBranch } = msg
    status = Number( msgStatus )

    pollTillComplete().then( () => triggerGitHubAction( msgBranch ) )
  } )
} else console.log( "don't run on main thread" )