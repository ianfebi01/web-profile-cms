import express from 'express'
import { Worker } from 'worker_threads'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const dir = dirname(fileURLToPath(import.meta.url))
const worker = new Worker(`${dir}/worker.mjs`)

const status = {
  main: 0,
  staging: 0
} // 0 = available, 1 = busy, 2 = queued

worker.on('message', ({ msg }) => {
  const { status, branch } = msg
  status[branch] = Number(msg) // Update status based on worker's message
  console.log(`Worker status: ${status[branch] === 0 ? 'Available' : status[branch] === 1 ? 'Busy' : 'Queued'}`)
})

const app = express()

app.post('/', async (req, res) => {
  let { branch } = req.query

  branch = typeof branch !== 'undefined' ? branch : 'static_files'

  if (status[branch] === 0) {
    console.log('Executing webhook')

    status[branch] = 1
    worker.postMessage({ status, branch })
    res.status(202).send('Webhook executed')
  } else if (status[branch] === 1) {
    console.log('Worker busy, queueing webhook')

    status[branch] = 2
    worker.postMessage({ status, branch })
    res.status(202).send('Queued')
  } else {
    console.log('Worker queue is full, try again later')
    res.status(429).send('Queue is full, try again later')
  }
})

const PORT = 80
app.listen(PORT, () => console.log(`Running webhook on PORT ${PORT}`))
