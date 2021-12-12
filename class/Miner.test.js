import tape from 'tape'
import _test from 'tape-promise'
import Block from './Block.js'
import Miner from './Miner.js'

const test = _test.default(tape) // decorate tape

test('Construction d\'un miner', function (t) {
  const miner = new Miner()

  const block = new Block(0, null, [], 100000, BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))

  miner.findPow(block)

  const find = new Promise((resolve) => {
    miner.once('pow', resolve)
  })

  return find.then((block) => {
    t.equal(block.nonce, 6973)
    t.equal(block.id, '0008fb9d19e42a03d17f4aac71d581a0d16b67667931439612a7d32c6d4ba129')
    t.equal(block.id, block.getHash())
    t.equal(block.isValid(), true)

    return block
  }).then((block) => {
    const blockBis = new Block(0, block.id, [], 100010, BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))

    miner.findPow(blockBis)

    return new Promise((resolve) => {
      miner.once('pow', resolve)
    })
  }).then((block) => {
    t.equal(block.nonce, 3239)
    t.equal(block.id, '000052c5ff02aa6eb8fb7717618043d4e357637c1163646458b7f96ef07f467b')
    t.equal(block.id, block.getHash())
    t.equal(block.isValid(), true)

    return block
  }).then(() => miner.kill())
})
