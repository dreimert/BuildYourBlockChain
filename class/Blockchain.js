import Block from './Block.js'
import log from './log.js'

export class Blockchain {
  constructor (genesis) {
    this.chain = [genesis]
    this.db = {}
    this.knownBlocks = {
      [genesis.id]: genesis
    }
    this.pendingTransactions = []
    this.knownTransactions = {}
  }

  async addBlock (block, socket) {
    if (!block.isValid()) {
      log.warn('block invalid')
      return false
    } else if (this.knownBlocks[block.id]) {
      return false
    } else {
      if (block.previous && !this.knownBlocks[block.previous]) {
        log.info('previous unknown')
        const previous = await new Promise((resolve, reject) => {
          socket.emit('blockById', block.previous, (error, block) => {
            if (error) {
              reject(error)
            } else {
              resolve(Block.fromObject(block))
            }
          })
        })
        await this.addBlock(previous, socket)
      }

      this.knownBlocks[block.id] = block

      if (block.verify(this)) {
        log.warn('verification success')
        if (block.index === this.last().index + 1 && block.previous === this.last().id) {
          log.info('add block', block)
          this.chain[block.index] = block
          this.pendingTransactions = this.pendingTransactions.filter((tx) => !block.transactions.find((t) => t.id === tx.id))
          block.transactions.forEach((tx) => {
            if (tx.type === 'set') {
              this.db[tx.params.key] = tx.params.value
            }
            if (!this.knownTransactions[tx.id]) {
              this.knownTransactions[tx.id] = tx
            }
          })
          return true
        } else if (block.index > this.last().index + 1) {
          log.info('rebuild chain from', block)
          this.rebuild(block)
          return true
        } else {
          return false
        }
      } else {
        log.warn('verification fail', block)
        return false
      }
    }
  }

  rebuild (block) {
    const _rebuild = (b) => {
      if (b.previous) {
        return _rebuild(this.knownBlocks[b.previous]).concat([b])
      } else {
        return [b]
      }
    }
    this.chain = _rebuild(block)
    this.db = this.chain.reduce((db, block) => {
      block.transactions.forEach((tx) => {
        if (tx.type === 'set') {
          db[tx.params.key] = tx.params.value
        }
      })
      return db
    }, {})
    const toRemove = this.chain.reduce((txs, block) => {
      return txs.concat(block.transactions)
    }, [])
    this.pendingTransactions = this.pendingTransactions.filter((tx) => !toRemove.find((t) => t.id === tx.id))
  }

  registerBlock (block) {
    this.knownBlocks[block.id] = block
  }

  addTransaction (tx) {
    if (!tx.verify(this)) {
      return false
    } else if (tx.type === 'reward') {
      return false
    } else if (this.knownTransactions[tx.id]) {
      return false
    } else {
      this.knownTransactions[tx.id] = tx
      this.pendingTransactions.push(tx)
      return true
    }
  }

  // Vérification locale
  buildNextBlock () {
    const last = this.last()
    return new Block(last.index + 1, last.id, this.pendingTransactions, Date.now(), last.difficulty)
  }

  blockByIndex (index) {
    return this.chain.at(index)
  }

  blockById (id) {
    return this.knownBlocks[id]
  }

  last () {
    return this.chain.at(-1)
  }

  get (key) {
    return this.db[key]
  }

  keys () {
    return Object.keys(this.db)
  }

  // Vérification globale
  verify (block) {
    return block.verify(this)
  }
}

export default Blockchain
