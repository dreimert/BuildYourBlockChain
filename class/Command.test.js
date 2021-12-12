import tape from 'tape'
import _test from 'tape-promise'
import Command from './Command.js'
import { generateKeyPairSync } from 'crypto'

const test = _test.default(tape) // decorate tape

const {
  publicKey,
  privateKey
} = generateKeyPairSync('dsa', {
  modulusLength: 2048,
  divisorLength: 160,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

test('Construction d\'une commande', function (t) {
  const cmd = new Command('set', { key: 'toto', value: 'la praline' }, publicKey)

  t.equal(cmd.verify(), false)

  cmd.sign(privateKey)

  t.equal(cmd.verify(), true)

  t.end()
})

test('fromJSON', function (t) {
  const cmd = new Command('set', { key: 'toto', value: 'la praline' }, publicKey)

  cmd.sign(privateKey)

  const cmdFromJson = Command.fromJSON(cmd.getJSON())

  t.equal(cmdFromJson.verify(), true)

  t.end()
})

test('fromObject', function (t) {
  const cmd = new Command('set', { key: 'toto', value: 'la praline' }, publicKey)

  cmd.sign(privateKey)

  const cmdFromObject = Command.fromObject(cmd)

  t.equal(cmdFromObject.verify(), true)

  t.end()
})
