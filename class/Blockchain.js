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
    this.identities = []
    this.identitiesMap = {}
    this.rewards = {}
  }

  async addBlock (block, socket) {
    if (!block.isValid()) {
      log.warn('block invalid', block)
      return false
    } else if (this.knownBlocks[block.id] && !(this.knownBlocks[block.id].then)) {
      return false
    } else {
      if (!block.previous) {
        log.warn('On ne peut pas changer le genesis', block)
        return false
      } else if (!this.knownBlocks[block.previous]) {
        log.info('previous unknown, download', block.previous)
        const previous = new Promise((resolve, reject) => {
          socket.emit('blockById', block.previous, (error, block) => {
            if (error) {
              reject(error)
            } else {
              resolve(Block.fromObject(block))
            }
          })
        })
        this.knownBlocks[block.previous] = previous
        await this.addBlock(await previous, socket)
      } else if (this.knownBlocks[block.previous].then) {
        await this.knownBlocks[block.previous]
      }

      this.knownBlocks[block.id] = block

      if (block.verify(this)) {
        if (block.index === this.last().index + 1 && block.previous === this.last().id) {
          log.info('add block', block.index, block.id)
          this.chain[block.index] = block
          block.transactions.forEach((tx) => {
            this.integrateTransaction(tx)
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
        log.warn('fail verification', block)
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
    this.identities = []
    this.identitiesMap = {}
    this.rewards = {}
    this.db = {}

    this.chain.forEach((block) => {
      block.transactions.forEach((tx) => {
        this.integrateTransaction(tx)
      })
    })
  }

  integrateTransaction (tx) {
    if (!this.knownTransactions[tx.id]) {
      this.knownTransactions[tx.id] = tx
    }

    const indexInPending = this.pendingTransactions.findIndex((pt) => pt.id === tx.id)

    if (indexInPending !== -1) {
      this.pendingTransactions.splice(indexInPending, 1)
    }

    if (tx.type === 'set') {
      this.db[tx.params.key] = tx.params.value
    } else if (tx.type === 'identity') {
      this.identities.push({ name: tx.params.name, pub: tx.user })
      this.identitiesMap[tx.user] = tx.params.name
    } else if (tx.type === 'reward') {
      if (this.identitiesMap[tx.user]) {
        this.rewards[this.identitiesMap[tx.user]] = (this.rewards[this.identitiesMap[tx.user]] || 0) + 1
      } else {
        this.rewards.unknown = (this.rewards.unknown || 0) + 1
      }
    }
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
    return new Block(last.index + 1, last.id, [...this.pendingTransactions], Date.now(), last.difficulty)
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

  getIdentities () {
    return this.identities
  }

  getRewards () {
    return this.rewards
  }

  // Vérification globale
  verify (block) {
    return block.verify(this)
  }
}

export default Blockchain
