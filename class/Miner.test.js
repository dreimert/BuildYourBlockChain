import tape from 'tape'
import _test from 'tape-promise'
import Block from './Block.js'
import Miner from './Miner.js'

const test = _test.default(tape) // decorate tape

test('Construction d\'un miner', function (t) {
  const miner = new Miner()

  const block = new Block(0, null, [], 100000, Block.MinimumDifficulty)

  miner.findPow(block)

  const find = new Promise((resolve) => {
    miner.once('pow', resolve)
  })

  return find.then((block) => {
    t.equal(block.nonce, 42969)
    t.equal(block.id, '0000a8bb2e10070f57fe9c08ddf5e13442d854a88a07eb02436035582ca1d9e7')
    t.equal(block.id, block.getHash())
    t.equal(block.isValid(), true)

    return block
  }).then((block) => {
    const blockBis = new Block(1, block.id, [], 100010, Block.MinimumDifficulty)

    miner.findPow(blockBis)

    return new Promise((resolve) => {
      miner.once('pow', resolve)
    })
  }).then((block) => {
    t.equal(block.nonce, 150336)
    t.equal(block.id, '0000f5f363a5870f0eca6578e07c6da2b24449bcb23308661117ad80bc9f6e48')
    t.equal(block.id, block.getHash())
    t.equal(block.isValid(), true)

    return block
  }).then(() => miner.kill())
})
