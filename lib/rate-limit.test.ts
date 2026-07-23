import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isAllowed } from './rate-limit.ts'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

test('allows requests up to the limit', () => {
  const key = `test:${Math.random()}`
  assert.equal(isAllowed(key, 3, 1000), true)
  assert.equal(isAllowed(key, 3, 1000), true)
  assert.equal(isAllowed(key, 3, 1000), true)
})

test('blocks once the limit is exceeded', () => {
  const key = `test:${Math.random()}`
  isAllowed(key, 2, 1000)
  isAllowed(key, 2, 1000)
  assert.equal(isAllowed(key, 2, 1000), false)
})

test('keys are independent — one key blocked does not affect another', () => {
  const blockedKey = `test:${Math.random()}`
  const otherKey = `test:${Math.random()}`
  isAllowed(blockedKey, 1, 1000)
  assert.equal(isAllowed(blockedKey, 1, 1000), false)
  assert.equal(isAllowed(otherKey, 1, 1000), true)
})

test('allows again once the window slides past', async () => {
  const key = `test:${Math.random()}`
  assert.equal(isAllowed(key, 1, 50), true)
  assert.equal(isAllowed(key, 1, 50), false)
  await sleep(60)
  assert.equal(isAllowed(key, 1, 50), true)
})
