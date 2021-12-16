import { createHash } from 'crypto'

import Transaction from './Transaction.js'
import log from './log.js'

class PoW {
  constructor (block) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })

    this.run(block)
  }

  async run (block) {
    this.run = true
    this.block = block

    while (this.run) {
      if (await block._pow()) {
        block.id = block.getHash()
        this.resolve(block)
        return
      }
    }

    this.reject(block)
  }

  cancel () {
    this.run = false
  }
}

export class Block {
  constructor (index, previous, transactions, timestamp = Date.now(), difficulty = Block.DefaultDifficulty, nonce = 0, id) {
    // Le mot clé `this` permet d'accèder aux propriétés de l'object depuis ses méthodes.
    this.index = index
    this.previous = previous
    this.transactions = transactions
    this.timestamp = timestamp
    this.difficulty = difficulty
    this.nonce = nonce

    this.id = id || this.getHash()
  }

  // Retourne l'identifiant du block en le calculant depuis les données
  getHash () {
    return createHash('sha256').update(`${this.index}${this.previous}${this.transactions}${this.timestamp}${this.difficulty}${this.nonce}`, 'utf8').digest('hex')
  }

  // Vérification locale
  isValid () {
    if (this.validaded === undefined) {
      if (this.index === 0 && this.previous !== null) {
        this.validaded = false
        return false
      }
      this.validaded = this.getHash() === this.id && BigInt('0x' + this.id) < this.difficulty && this.difficulty <= Block.MinimumDifficulty && this.transactions.reduce((isValid, tx, i) => {
        if (tx.type === 'reward' && i !== 0) {
          log.warn('Bad reward', this)
          return false
        }
        return isValid && tx.isValid()
      }, true)
    }

    return this.validaded
  }

  _verify (blockchain) {
    if (!this.isValid()) {
      log.debug('_verify::isValid:false')
      return false
    }

    for (let i = 0; i < this.transactions.length; i++) {
      if (!this.transactions[i].verify(blockchain)) {
        log.debug('_verify::transactions:transaction invalid')
        return false
      }
    }

    if (this.previous) {
      const previous = blockchain.knownBlocks[this.previous]

      if (!previous || previous.index + 1 !== this.index || this.timestamp < previous.timestamp || !previous.verify(blockchain)) {
        log.debug('_verify::previous:oups')
        return false
      }
    }

    return true
  }

  // Vérification globale
  verify (blockchain) {
    if (this.verified === undefined) {
      this.verified = this._verify(blockchain)
    }

    return this.verified
  }

  // Permet de trouver une empreinte valide
  powSync () {
    while (BigInt('0x' + this.getHash()) > this.difficulty) {
      this.nonce++
    }

    this.id = this.getHash()

    return this.nonce // retournez un nombre
  }

  pow () {
    return new PoW(this)
  }

  async _pow () {
    return new Promise((resolve) => {
      setTimeout(() => {
        let i = 0

        while (i < 1000) {
          if (BigInt('0x' + this.getHash()) < this.difficulty) {
            return resolve(true)
          }
          ++this.nonce
          ++i
        }

        return resolve(false)
      })
    }, 0)
  }

  toJSON () {
    return { index: this.index, previous: this.previous, transactions: this.transactions, timestamp: this.timestamp, difficulty: '0x' + this.difficulty.toString(16), nonce: this.nonce, id: this.id }
  }

  static fromJSON (json) {
    const { index, previous, transactions, timestamp, difficulty, nonce, id } = JSON.parse(json)

    return new Block(index, previous, transactions.map((tx) => Transaction.fromJSON(tx)), timestamp, BigInt(difficulty), nonce, id)
  }

  static fromObject (object) {
    const { index, previous, transactions, timestamp, difficulty, nonce, id } = object
    return new Block(index, previous, transactions.map((tx) => Transaction.fromObject(tx)), timestamp, BigInt(difficulty), nonce, id)
  }

  static get DefaultDifficulty () {
    return BigInt('0x000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  }

  static get MinimumDifficulty () {
    return BigInt('0x00fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  }
}

export default Block
