/** 最小自檢：node src/lib/characterDrafts.check.ts */
// ponytail: 不引 node 型別，自帶兩行 assert 讓瀏覽器 tsconfig 也能編譯
const assert = {
  equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`expected ${expected}, got ${actual}`)
  },
}
import {
  PARTY_SIZE_MAX,
  draftLabel,
  makeDrafts,
  parsePartySize,
  removeDraft,
  updateDraft,
} from './characterDrafts.ts'

// 人數邊界
assert.equal(parsePartySize('1'), 1)
assert.equal(parsePartySize(String(PARTY_SIZE_MAX)), PARTY_SIZE_MAX)
assert.equal(parsePartySize('0'), null)
assert.equal(parsePartySize(String(PARTY_SIZE_MAX + 1)), null)
assert.equal(parsePartySize(''), null)
assert.equal(parsePartySize('2.5'), null)
assert.equal(parsePartySize('abc'), null)

// 草稿獨立更新
const drafts = makeDrafts(3, () => ({ name: '' }))
assert.equal(drafts.length, 3)
assert.equal(new Set(drafts.map((d) => d.id)).size, 3)
const updated = updateDraft(drafts, drafts[1]!.id, { name: '小美' })
assert.equal(updated[0]!.values.name, '')
assert.equal(updated[1]!.values.name, '小美')
assert.equal(updated[2]!.values.name, '')

// 刪除中間 → 選相鄰（後一位補上同位置）
const midRemoved = removeDraft(updated, updated[1]!.id)
assert.equal(midRemoved.drafts.length, 2)
assert.equal(midRemoved.selectedId, updated[2]!.id)

// 刪除最後一個位置 → 選前一位
const tailRemoved = removeDraft(midRemoved.drafts, midRemoved.drafts[1]!.id)
assert.equal(tailRemoved.selectedId, midRemoved.drafts[0]!.id)

// 保護最後一位：不刪除
const protectedResult = removeDraft(tailRemoved.drafts, tailRemoved.drafts[0]!.id)
assert.equal(protectedResult.drafts.length, 1)
assert.equal(protectedResult.selectedId, tailRemoved.drafts[0]!.id)

// 分頁標籤
assert.equal(draftLabel('', 0), '角色 1')
assert.equal(draftLabel('  ', 1), '角色 2')
assert.equal(draftLabel('阿明', 2), '阿明')

console.log('characterDrafts self-check passed')
