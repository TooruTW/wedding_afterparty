// 一次性 MVP 連通性檢查：報名 / 登入 / 預設角色 / 名單讀取 / 上限。
// 用法：node --env-file=.env mvp-check.mjs
import { createClient } from '@supabase/supabase-js'
import { registerHooks } from 'node:module'

// src 的 import 沒帶副檔名（靠 bundler 解析），Node 需要補上 .ts
registerHooks({
  resolve(spec, ctx, next) {
    try {
      return next(spec, ctx)
    } catch {
      return next(`${spec}.ts`, ctx)
    }
  },
})
const { makeInitialCharacters } = await import('./src/lib/initialCharacters.ts')

const db = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

let pass = 0
let fail = 0
function check(ok, label, extra = '') {
  if (ok) {
    pass++
    console.log(`  PASS  ${label}`)
  } else {
    fail++
    console.log(`  FAIL  ${label} ${extra}`)
  }
}

// 以下三個函式對應 src/data/accounts.ts（該檔透過 beanFace 相依 three，Node 無法直接載入）
async function fetchCharacters() {
  const { data, error } = await db
    .from('characters')
    .select('id, name, eye_style, head_size, message, account_id')
    .order('created_at')
  if (error) throw new Error(error.message)
  return data
}

async function postRegister(values) {
  const { error } = await db.from('accounts').insert({
    email: values.email,
    real_name: values.realName,
    nickname: values.nickname,
    drinks: values.drinks,
    diet: values.diet,
  })
  if (error) {
    if (error.code === '23505') throw new Error('這個 Email 已經報名過了，請直接登入')
    throw new Error(error.message)
  }
  return postLogin(values.email)
}

async function postLogin(email) {
  const { data, error } = await db.rpc('get_account_by_email', { p_email: email })
  if (error) throw new Error(error.message)
  if (data == null) throw new Error('找不到這個 Email')
  return data
}

async function saveCharacters(accountId, guests) {
  const { error: delError } = await db.from('characters').delete().eq('account_id', accountId)
  if (delError) throw new Error(delError.message)
  if (guests.length === 0) return
  const { error: insError } = await db.from('characters').insert(
    guests.map((g) => ({
      account_id: accountId,
      name: g.name,
      eye_style: g.face,
      head_size: g.body.headSize,
      message: g.say,
    })),
  )
  if (insError) throw new Error(insError.message)
}

const stamp = Date.now()
const email = `mvp-check+${stamp}@example.com`
let accountId = null

try {
  console.log('\n[0] 連線 / 讀取現有名單')
  const before = await fetchCharacters()
  check(Array.isArray(before), '可讀取 characters（公開名單）', '')
  console.log(`        目前場上角色數：${before.length}`)

  console.log('\n[1] 報名（partySize=3）')
  const account = await postRegister({
    email,
    realName: '測試員',
    nickname: '阿測',
    drinks: true,
    diet: '',
  })
  accountId = account.id
  check(!!account.id, '報名建立帳號成功')
  check(account.email === email, 'email 寫入正確', `got ${account.email}`)

  console.log('\n[2] 報名後自動生成預設角色')
  await saveCharacters(
    accountId,
    makeInitialCharacters(3, { nickname: '阿測', realName: '測試員' }),
  )
  const afterSeed = await postLogin(email)
  const names = (afterSeed.characters ?? []).map((c) => c.name)
  check(names.length === 3, '角色數 = partySize(3)', `got ${names.length}`)
  check(names[0] === '阿測', '第一隻用 nickname', `got ${names[0]}`)
  check(
    names.slice(1).every((n) => n === '家眷'),
    '第二隻起為「家眷」',
    `got ${JSON.stringify(names)}`,
  )
  const first = (afterSeed.characters ?? [])[0]
  check(first?.eyeStyle === 'dots', '預設臉 = dots', `got ${first?.eyeStyle}`)
  check(Number(first?.headSize) === 1, '預設 headSize = 1', `got ${first?.headSize}`)
  check(first?.message === '我在說好聽話', '預設台詞已寫入', `got ${first?.message}`)

  console.log('\n[3] 登入')
  const login = await postLogin(email)
  check(login.id === accountId, '同 email 登入取回同一帳號')
  check((login.characters ?? []).length === 3, '登入帶回自己的角色')
  let notFound = ''
  try {
    await postLogin(`nobody+${stamp}@example.com`)
  } catch (e) {
    notFound = e.message
  }
  check(notFound === '找不到這個 Email', '未報名 email 登入回錯誤訊息', `got "${notFound}"`)
  let dup = ''
  try {
    await postRegister({ email, realName: 'x', nickname: 'x', drinks: false, diet: '' })
  } catch (e) {
    dup = e.message
  }
  check(dup.includes('已經報名過'), '重複 email 報名被擋', `got "${dup}"`)

  console.log('\n[4] 角色出現在公開名單（前端 spawn 來源）')
  const floor = await fetchCharacters()
  const mine = floor.filter((c) => c.account_id === accountId)
  check(mine.length === 3, '自己的角色出現在公開名單', `got ${mine.length}`)
  check(
    mine.every((c) => c.name && c.eye_style && c.head_size != null),
    '欄位齊全，可轉成 FakeGuest',
  )

  console.log('\n[5] 每帳號角色上限（DB trigger）')
  let limitMsg = 'no error'
  try {
    await saveCharacters(
      accountId,
      Array.from({ length: 11 }, (_, i) => ({
        name: `超額${i}`,
        face: 'dots',
        say: 'x',
        body: { headSize: 1 },
      })),
    )
    const over = await postLogin(email)
    limitMsg = `寫入成功，共 ${(over.characters ?? []).length} 隻`
  } catch (e) {
    limitMsg = e.message
  }
  console.log(`        寫 11 隻的結果：${limitMsg}`)
  check(true, '（僅記錄，不判定）')
} catch (cause) {
  fail++
  console.log(`\n  ERROR ${cause.message}`)
} finally {
  console.log('\n[9] 清理測試資料')
  if (accountId) {
    const { error: delChar } = await db.from('characters').delete().eq('account_id', accountId)
    const { error: delAcc } = await db.from('accounts').delete().eq('id', accountId)
    const left = (await fetchCharacters()).filter((c) => c.account_id === accountId)
    check(left.length === 0, '測試角色已刪除', delChar?.message ?? '')
    let stillThere = false
    try {
      await postLogin(email)
      stillThere = true
    } catch {
      stillThere = false
    }
    check(!stillThere, '測試帳號已刪除', delAcc?.message ?? '（accounts 可能沒有 DELETE policy）')
  }
  console.log(`\n總計：${pass} passed, ${fail} failed\n`)
  process.exit(fail ? 1 : 0)
}
