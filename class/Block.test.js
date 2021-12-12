import tape from 'tape'
import _test from 'tape-promise'
import Block from './Block.js'

const test = _test.default(tape) // decorate tape

async function delay (millisecondes) {
  return new Promise((resolve) => setTimeout(resolve, millisecondes))
}

test('Construction d\'un block', function (t) {
  const block = new Block(0, null, [], 100000)

  t.equal(block.id, '2f91a44ef91de87967469116122c46948b62937a336ea4bfb216cf91063517a0')
  t.equal(block.id, block.getHash())
  t.equal(block.isValid(), false)

  t.equal(block.powSync(), 433553)

  t.equal(block.id, '00000365dd6c295c28ccf81df295729da4cfeb7b9a531eefe3c39d341a8228de')
  t.equal(block.id, block.getHash())
  t.equal(block.isValid(), true)

  t.end()
})

test('parseInt', function (t) {
  const block = new Block(0, null, [], 100000)

  t.equal(block.id, '2f91a44ef91de87967469116122c46948b62937a336ea4bfb216cf91063517a0')

  t.equal(BigInt(`0x${block.id}`), BigInt('0x2f91a44ef91de87967469116122c46948b62937a336ea4bfb216cf91063517a0'))
  t.equal(BigInt(`0x${block.id}`).toString(16), '2f91a44ef91de87967469116122c46948b62937a336ea4bfb216cf91063517a0')

  t.end()
})

test('fromJSON', function (t) {
  const block = new Block(0, null, [], 100000, BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))

  t.equal(block.powSync(), 6973)

  const blockFromJson = Block.fromJSON(JSON.stringify(block))

  t.equal(blockFromJson.verify(), true)

  t.end()
})

test('fromObject', function (t) {
  const block = new Block(0, null, [], 100000, BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'))

  t.equal(block.powSync(), 6973)

  const blockFromObject = Block.fromObject(block)

  t.equal(blockFromObject.verify(), true)

  t.end()
})

test('PoW', async function (t) {
  const block = new Block(0, null, [], 100000, BigInt('0xf'))

  t.equal(block.id, 'baa0039f5242e0fd955d345ddff4c3b83760269646199e61cff4b33bb174eab6')
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
