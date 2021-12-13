import { createSign, createVerify, createHash } from 'crypto'

export class Transaction {
  constructor (type, params, user, signature = '', id = '') {
    this.type = type
    this.params = params
    this.user = user
    this.signature = signature
    this.id = id
  }

  toSign () {
    return JSON.stringify({
      type: this.type,
      params: this.params,
      user: this.user
    })
  }

  sign (privateKey) {
    const sign = createSign('SHA256')
    sign.write(this.toSign())
    sign.end()
    this.signature = sign.sign(privateKey, 'hex')
    this.id = this.getHash()
  }

  isValid () {
    if (this.validaded === undefined) {
      const verify = createVerify('SHA256')
      verify.write(this.toSign())
      verify.end()

      if (this.type === 'set') {
        this.validaded = verify.verify(this.user, this.signature, 'hex') && this.id === this.getHash() && this.params.key && this.params.value && Object.keys(this.params).length === 2
      } else if (this.type === 'identity') {
        this.validaded = verify.verify(this.user, this.signature, 'hex') && this.id === this.getHash() && this.params.name && Object.keys(this.params).length === 1
      } else if (this.type === 'reward') {
        this.validaded = verify.verify(this.user, this.signature, 'hex') && this.id === this.getHash() && this.params === null
      } else {
        this.validaded = false
      }
    }

    return this.validaded
  }

  verify (blockchain) {
    return this.isValid()
  }

  getJSON () {
    return JSON.stringify(this)
  }

  getHash () {
    return createHash('sha256').update(JSON.stringify({
      type: this.type,
      params: this.params,
      user: this.user,
      signature: this.signature
    }), 'utf8').digest('hex')
  }

  toString () {
    return this.getHash()
  }

  static fromJSON (json) {
    const { type, params, user, signature, id } = JSON.parse(json)
    return new Transaction(type, params, user, signature, id)
  }

  static fromObject (object) {
    const { type, params, user, signature, id } = object
    return new Transaction(type, params, user, signature, id)
  }

  static fromCommand (cmd) {
    const { type, params, user, signature } = cmd
    const tx = new Transaction(type, params, user, signature)

    tx.id = tx.getHash()

    return tx
  }

  static get types () {
    return ['set', 'identity', 'reward']
  }
}

export default Transaction
