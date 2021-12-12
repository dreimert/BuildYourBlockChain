import tape from 'tape'
import _test from 'tape-promise'
import { generateKeyPairSync } from 'crypto'

import Transaction from './Transaction.js'
import Command from './Command.js'

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
  const tx = new Transaction('set', { key: 'toto', value: 'la praline' }, publicKey)

  t.equal(tx.verify(), false)

  tx.sign(privateKey)

  t.equal(tx.verify(), true)

  t.end()
})

test('fromJSON', function (t) {
  const tx = new Transaction('set', { key: 'toto', value: 'la praline' }, publicKey)

  tx.sign(privateKey)

  const txFromJson = Transaction.fromJSON(tx.getJSON())

  t.equal(txFromJson.verify(), true)

  t.end()
})

test('fromObject', function (t) {
  const tx = new Transaction('set', { key: 'toto', value: 'la praline' }, publicKey)

  tx.sign(privateKey)

  const txFromObject = Transaction.fromObject(tx)

  t.equal(txFromObject.verify(), true)

  t.end()
})

test('fromCommand', function (t) {
  const cmd = new Command('set', { key: 'toto', value: 'la praline' }, publicKey)

  cmd.sign(privateKey)

  t.equal(cmd.verify(), true)

  const txFromCommand = Transaction.fromCommand(cmd)

  t.equal(txFromCommand.verify(), true)

  t.end()
})

test('toString', function (t) {
  const tx = new Transaction('set', { key: 'toto', value: 'la praline' }, publicKey)

  tx.sign(privateKey)

  t.ok(tx.toString().match(/^[0-9a-f]{64}$/))

  t.end()
})
