// 一次性前端檢查：攔截 Supabase 名單回傳 N 隻假角色，量 FPS + 截圖。
// 用法：node perf-check.mjs [人數] [dev server url]
// 走 CDP（Node 內建 WebSocket + 本機 Chrome），不裝任何依賴。
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const COUNT = Number(process.argv[2] ?? 30)
const URL_APP = process.argv[3] ?? 'http://localhost:5199/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
// 每次換埠，避免接到上一輪殘留的除錯實例
const PORT = 9400 + Math.floor(Math.random() * 400)
const MEASURE_MS = 6000

const FACES = ['dots', 'bars']
const rows = Array.from({ length: COUNT }, (_, i) => ({
  id: `fake-${i}`,
  name: `賓客${i + 1}`,
  eye_style: FACES[i % FACES.length],
  head_size: 1,
  message: '我在說好聽話',
}))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForJson(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
    } catch {
      /* 還沒起來 */
    }
    await sleep(250)
  }
  throw new Error(`timeout waiting for ${url}`)
}

/** 極簡 CDP client：id 對應 promise，事件走 listener */
function connect(wsUrl) {
  const ws = new WebSocket(wsUrl)
  const pending = new Map()
  const listeners = []
  let nextId = 1

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id != null) {
      const entry = pending.get(msg.id)
      pending.delete(msg.id)
      if (!entry) return
      if (msg.error) entry.reject(new Error(JSON.stringify(msg.error)))
      else entry.resolve(msg.result)
      return
    }
    for (const fn of listeners) fn(msg)
  })

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', reject, { once: true })
  })

  return {
    ready,
    on: (fn) => listeners.push(fn),
    close: () => ws.close(),
    send(method, params = {}, sessionId) {
      const id = nextId++
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params, sessionId }))
      })
    },
  }
}

const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`)

const profile = mkdtempSync(join(tmpdir(), 'cdp-'))
log(`launching chrome on port ${PORT}, profile ${profile}`)
const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1280,800',
    // 視窗被遮住時 Chrome 會停掉 rAF，量不到 FPS
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling',
    URL_APP,
  ],
  { stdio: 'ignore' },
)
chrome.on('error', (e) => log(`chrome spawn error: ${e.message}`))
chrome.on('exit', (code) => log(`chrome exited: ${code}`))

try {
  const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`)
  log(`devtools up: ${version.Browser}`)
  const cdp = connect(version.webSocketDebuggerUrl)
  await cdp.ready
  log('cdp connected')

  const targets = await waitForTarget(cdp)
  log(`target ${targets.url}`)
  const { sessionId } = await cdp.send('Target.attachToTarget', {
    targetId: targets.targetId,
    flatten: true,
  })
  log(`attached ${sessionId}`)

  const send = (method, params) => cdp.send(method, params, sessionId)

  await send('Page.enable')
  await send('Runtime.enable')
  // 沒有 session 時 App 會自動開 dialog 並把 frameloop 設成 never，量不到 FPS
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `localStorage.setItem('wedding-party-auth', JSON.stringify({
      loggedIn: true,
      email: 'perf-check@example.com',
      expiresAt: Date.now() + 3600000,
    }))`,
  })
  await send('Fetch.enable', {
    patterns: [
      { urlPattern: '*/rest/v1/characters*', requestStage: 'Request' },
      { urlPattern: '*/rest/v1/rpc/get_account_by_email*', requestStage: 'Request' },
    ],
  })

  // 登入也要 stub，否則 session 失效 → dialog 自動開啟 → frameloop 停掉，FPS 就白量了
  // 第一次登入給「舊名字」，之後給「新名字」：dialog 若顯示新名字就代表真的重抓了
  let loginCalls = 0
  const account = () => ({
    id: 'fake-account',
    email: 'perf-check@example.com',
    realName: '效能測試',
    nickname: '效能測試',
    drinks: false,
    diet: '',
    characters: [
      {
        id: 'own-1',
        name: loginCalls++ === 0 ? '舊名字' : '新名字',
        eyeStyle: 'dots',
        headSize: 1,
        message: '我在說好聽話',
      },
    ],
  })

  let stubbed = 0
  cdp.on(async (msg) => {
    if (msg.method !== 'Fetch.requestPaused' || msg.sessionId !== sessionId) return
    const { requestId, request } = msg.params
    const isRpc = request.url.includes('/rpc/get_account_by_email')
    if (!isRpc && request.method !== 'GET') {
      await send('Fetch.continueRequest', { requestId })
      return
    }
    stubbed++
    await send('Fetch.fulfillRequest', {
      requestId,
      responseCode: 200,
      responseHeaders: [
        { name: 'content-type', value: 'application/json' },
        { name: 'access-control-allow-origin', value: '*' },
        { name: 'access-control-allow-headers', value: '*' },
        { name: 'access-control-allow-methods', value: '*' },
      ],
      body: Buffer.from(JSON.stringify(isRpc ? account() : rows)).toString('base64'),
    })
  })

  log('navigating')
  await send('Page.navigate', { url: URL_APP })
  await sleep(6000)
  log(`stubbed ${stubbed} character requests`)

  const probe = await send('Runtime.evaluate', {
    expression: `(() => {
      const canvas = document.querySelector('canvas')
      const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
      return JSON.stringify({
        canvas: !!canvas,
        size: canvas ? canvas.width + 'x' + canvas.height : null,
        dialogOpen: !!document.querySelector('[data-slot="dialog-content"]'),
        renderer: gl ? gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info')?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER) : null,
      })
    })()`,
    returnByValue: true,
  })
  const info = JSON.parse(probe.result.value)

  log(`probe ${probe.result.value}`)

  if (process.argv.includes('--dialog')) {
    const before = stubbed
    const clicked = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('[aria-label="開啟對話框"]')?.click() || true`,
      returnByValue: true,
    })
    await sleep(2500)
    const shown = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        open: !!document.querySelector('[data-slot="dialog-content"]'),
        name: document.querySelector('[data-slot="dialog-content"] input[name="name"]')?.value ?? null,
      })`,
      returnByValue: true,
    })
    const view = JSON.parse(shown.result.value)
    console.log(`\n開啟 dialog 測試`)
    console.log(`  點到按鈕：${clicked.result.value} / dialog 開啟：${view.open}`)
    console.log(`  點擊前後端請求數 ${before} → 點擊後 ${stubbed}`)
    console.log(
      `  ${stubbed > before ? '有重新抓後端資料' : '沒有重新抓後端資料（沿用舊 state）'}`,
    )
    console.log(
      `  表單顯示的角色名：${view.name}（"新名字" = 用到重抓的結果，"舊名字" = 還是舊 state）\n`,
    )
    await cdp.send('Browser.close').catch(() => {})
    cdp.close()
    await sleep(500)
    if (chrome.exitCode === null) chrome.kill()
    process.exit(0)
  }

  log('measuring fps')
  const fpsRes = await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const frames = []
      let last = performance.now()
      const stop = last + ${MEASURE_MS}
      function tick(now) {
        frames.push(now - last)
        last = now
        if (now < stop) requestAnimationFrame(tick)
        else {
          const sorted = [...frames].sort((a, b) => a - b)
          const total = frames.reduce((a, b) => a + b, 0)
          resolve(JSON.stringify({
            frames: frames.length,
            avgFps: +(1000 / (total / frames.length)).toFixed(1),
            medianMs: +sorted[Math.floor(sorted.length / 2)].toFixed(2),
            p95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
            worstMs: +sorted[sorted.length - 1].toFixed(2),
            over33ms: frames.filter((f) => f > 33.4).length,
          }))
        }
      }
      requestAnimationFrame(tick)
    })`,
    awaitPromise: true,
    returnByValue: true,
  })
  const fps = JSON.parse(fpsRes.result.value)

  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const shotPath = join(process.cwd(), `perf-${COUNT}.png`)
  writeFileSync(shotPath, Buffer.from(shot.data, 'base64'))

  console.log(`\n人數 ${COUNT}`)
  console.log(`  名單攔截次數 ${stubbed}`)
  console.log(`  canvas ${info.canvas} ${info.size} / dialog 開著: ${info.dialogOpen}`)
  console.log(`  GPU ${info.renderer}`)
  console.log(
    `  FPS 平均 ${fps.avgFps} / 中位幀 ${fps.medianMs}ms / p95 ${fps.p95Ms}ms / 最差 ${fps.worstMs}ms / 掉到 30fps 以下的幀 ${fps.over33ms}`,
  )
  console.log(`  截圖 ${shotPath}\n`)

  await cdp.send('Browser.close').catch(() => {})
  cdp.close()
} finally {
  await sleep(500)
  if (chrome.exitCode === null) chrome.kill()
}

async function waitForTarget(cdp) {
  for (let i = 0; i < 40; i++) {
    const { targetInfos } = await cdp.send('Target.getTargets')
    const page = targetInfos.find((t) => t.type === 'page' && !t.url.startsWith('devtools'))
    if (page) return page
    await sleep(250)
  }
  throw new Error('no page target')
}
