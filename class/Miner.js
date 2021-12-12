import path from 'path'
import url from 'url'
import { Worker } from 'worker_threads'
import EventEmitter from 'events'

import Block from './Block.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export class Miner extends EventEmitter {
  constructor () {
    super()

    this.worker = new Worker(path.resolve(__dirname, './worker.js'))

    this.worker.on('message', (block) => {
      this.emit('pow', Block.fromObject(block))
    })

    this.worker.on('error', console.error)
    this.worker.on('exit', (code) => {
      console.error('Worker exist with code ', code)
    })
  }

  findPow (block) {
    this.worker.postMessage(block)
  }

  kill () {
    return this.worker.terminate()
  }
}

export default Miner
