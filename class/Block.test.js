import tape from 'tape'
import _test from 'tape-promise'
import Block from './Block.js'

const test = _test.default(tape) // decorate tape

async function delay (millisecondes) {
  return new Promise((resolve) => setTimeout(resolve, millisecondes))
}

test('Construction d\'un block', function (t) {
  const block = new Block(0, null, [], 100000)

  t.equal(block.id, '857adba409f24d21c02c9bf204b0a9a7660e4e46f368c6fbc07817a0b3083e03')
  t.equal(block.id, block.getHash())
  t.equal(block.isValid(), false)

  t.equal(block.powSync(), 902601)

  t.equal(block.id, '000007979368b3cdba41c996a41e9ebc6c0f3981edf258c98670df6d1dba1fa6')
  t.equal(block.id, block.getHash())
  t.equal(block.isValid(), true)

  t.end()
})

test('parseInt', function (t) {
  const block = new Block(0, null, [], 100000)

  t.equal(block.id, '857adba409f24d21c02c9bf204b0a9a7660e4e46f368c6fbc07817a0b3083e03')

  t.equal(BigInt(`0x${block.id}`), BigInt('0x857adba409f24d21c02c9bf204b0a9a7660e4e46f368c6fbc07817a0b3083e03'))
  t.equal(BigInt(`0x${block.id}`).toString(16), '857adba409f24d21c02c9bf204b0a9a7660e4e46f368c6fbc07817a0b3083e03')

  t.end()
})

test('fromJSON', function (t) {
  const block = new Block(0, null, [], 100000, Block.MinimumDifficulty)

  t.equal(block.powSync(), 42969)

  const blockFromJson = Block.fromJSON(JSON.stringify(block))

  t.equal(blockFromJson.verify(), true)

  t.end()
})

test('fromObject', function (t) {
  const block = new Block(0, null, [], 100000, Block.MinimumDifficulty)

  t.equal(block.powSync(), 42969)

  const blockFromObject = Block.fromObject(block)

  t.equal(blockFromObject.verify(), true)

  t.end()
})

test('PoW', async function (t) {
  const block = new Block(0, null, [], 100000, BigInt('0xf'))

  t.equal(block.id, '0ed23222cbfc6540fabbf23557cb514d017214e0c981aaab4e23fc235507e417')
  t.equal(block.id, block.getHash())
  t.equal(block.isValid(), false)

  const controler = block.pow()

  await delay(1000)

  t.ok(block.nonce > 0)
  t.equal(block.isValid(), false)

  controler.cancel()

  return controler.promise.catch((b) => {
    t.equal(b, block)
  })
})
