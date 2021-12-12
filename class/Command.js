import { createSign, createVerify } from 'crypto'

export class Command {
  constructor (type, params, user, signature = '') {
    this.type = type
    this.params = params
    this.user = user
    this.signature = signature
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
  }

  isValid () {
    const verify = createVerify('SHA256')
    verify.write(this.toSign())
    verify.end()

    return verify.verify(this.user, this.signature, 'hex')
  }

  verify () {
    return this.isValid()
  }

  getJSON () {
    return JSON.stringify(this)
  }

  static fromJSON (json) {
    const { type, params, user, signature } = JSON.parse(json)
    return new Command(type, params, user, signature)
  }

  static fromObject (object) {
    const { type, params, user, signature } = object
    return new Command(type, params, user, signature)
  }
}

export default Command
