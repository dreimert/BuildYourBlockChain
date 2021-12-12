import tape from 'tape'
import _test from 'tape-promise'

import Blockchain from './Blockchain.js'
import Block from './Block.js'

const test = _test.default(tape) // decorate tape

test('Construction d\'une Blockchain', async function (t) {
  const genesis = new Block(0, null, [], 100000, BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))

  t.equal(genesis.powSync(), 6973, '6973')

  const blockchain = new Blockchain(genesis)

  t.equal(blockchain.last(), genesis, 'last === genesis')
  t.equal(blockchain.chain.length, 1, 'la chaine contient un block')
  t.equal(blockchain.chain[0], genesis, 'la chaine contient le genesis')

  const first = new Block(1, genesis.id, [], 110000, BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))

  t.equal(first.powSync(), 1695, '1695')

  await blockchain.addBlock(first)

  t.equal(blockchain.last(), first, 'le dernier block de la chaine est first')

  const nextBlock = blockchain.buildNextBlock()

  t.equal(nextBlock.index, 2)
  t.equal(nextBlock.previous, first.id)
  t.equal(nextBlock.transactions.length, 0)
  t.ok(nextBlock.timestamp > Date.now() - 1000)
  t.equal(nextBlock.difficulty, BigInt('0x0000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))
  t.equal(nextBlock.nonce, 0)
})
