/** 出席人數集中上限。ponytail: 產品未定案，先取小型聚會保守值，之後只改這裡 */
export const PARTY_SIZE_MAX = 10

/** 驗證出席人數：1..MAX 的整數才回傳數字，其餘回 null */
export function parsePartySize(raw: string): number | null {
  const n = Number(raw.trim())
  return Number.isInteger(n) && n >= 1 && n <= PARTY_SIZE_MAX ? n : null
}

/** 角色草稿：穩定暫時 ID + 一份表單值（不以陣列索引當身分） */
export type Draft<T> = { id: string; values: T }

export function makeDrafts<T>(count: number, empty: () => T): Draft<T>[] {
  return Array.from({ length: count }, () => ({
    id: crypto.randomUUID(),
    values: empty(),
  }))
}

export function updateDraft<T>(drafts: Draft<T>[], id: string, values: T): Draft<T>[] {
  return drafts.map((d) => (d.id === id ? { ...d, values } : d))
}

/** 移除指定草稿並回傳相鄰草稿的 ID；最後一位受保護，不會被移除 */
export function removeDraft<T>(
  drafts: Draft<T>[],
  id: string,
): { drafts: Draft<T>[]; selectedId: string } {
  const index = drafts.findIndex((d) => d.id === id)
  if (index < 0 || drafts.length <= 1) {
    return { drafts, selectedId: drafts[0]?.id ?? '' }
  }
  const next = drafts.filter((d) => d.id !== id)
  const adjacent = next[Math.min(index, next.length - 1)]!
  return { drafts: next, selectedId: adjacent.id }
}

/** 分頁標籤：已填名字優先，否則「角色 N」 */
export function draftLabel(name: string, index: number): string {
  return name.trim() || `角色 ${index + 1}`
}
