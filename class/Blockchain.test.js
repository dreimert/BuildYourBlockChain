import tape from 'tape'
import _test from 'tape-promise'

import Blockchain from './Blockchain.js'
import Block from './Block.js'

const test = _test.default(tape) // decorate tape

test('Construction d\'une Blockchain', async function (t) {
  const genesis = new Block(0, null, [], 100000, Block.MinimumDifficulty)

  t.equal(genesis.powSync(), 42969, '42969')

  const blockchain = new Blockchain(genesis)

  t.equal(blockchain.last(), genesis, 'last === genesis')
  t.equal(blockchain.chain.length, 1, 'la chaine contient un block')
  t.equal(blockchain.chain[0], genesis, 'la chaine contient le genesis')

  const first = new Block(1, genesis.id, [], 110000, Block.MinimumDifficulty)

  t.equal(first.powSync(), 14651, '14651')

  await blockchain.addBlock(first)

  t.equal(blockchain.last(), first, 'le dernier block de la chaine est first')

  const nextBlock = blockchain.buildNextBlock()

  t.equal(nextBlock.index, 2)
  t.equal(nextBlock.previous, first.id)
  t.equal(nextBlock.transactions.length, 0)
  t.ok(nextBlock.timestamp > Date.now() - 1000)
  t.equal(nextBlock.difficulty, first.difficulty, 'même difficulté que le block précédent')
  t.equal(nextBlock.nonce, 0)
})

test('Une chaîne concurrente plus longue remplace la chaîne actuelle', async function (t) {
  const genesis = new Block(0, null, [], 100000, Block.MinimumDifficulty)
  genesis.powSync()

  const blockchain = new Blockchain(genesis)

  const a1 = new Block(1, genesis.id, [], 110000, Block.MinimumDifficulty)
  a1.powSync()
  await blockchain.addBlock(a1)

  const b1 = new Block(1, genesis.id, [], 120000, Block.MinimumDifficulty)
  b1.powSync()
  t.equal(await blockchain.addBlock(b1), false, 'à longueur égale, on garde la chaîne actuelle')
  t.equal(blockchain.last(), a1)

  const b2 = new Block(2, b1.id, [], 130000, Block.MinimumDifficulty)
  b2.powSync()
  t.equal(await blockchain.addBlock(b2), b2, 'la branche b, plus longue d\'un block, est adoptée')
  t.deepEqual(blockchain.chain, [genesis, b1, b2])
})
