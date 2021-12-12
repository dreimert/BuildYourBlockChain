import { parentPort } from 'worker_threads'

import Block from './Block.js'
import log from './log.js'

let controler

parentPort.on('message', async (block) => {
  if (controler?.run) {
    controler.cancel()
  }

  block = Block.fromObject(block)

  controler = block.pow()

  controler.promise
    .then((block) => parentPort.postMessage(block))
    .catch(() => log.info('pow cancel'))
})
