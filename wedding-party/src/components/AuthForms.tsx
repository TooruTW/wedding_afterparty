import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PARTY_SIZE_MAX, parsePartySize } from '../lib/characterDrafts'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'
import  weddingImage  from '@/assets/image/after-party-image.webp'
export const fieldClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/** 註冊表單較長：還沒滑到底時顯示向下箭頭 */
function ScrollHint() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const box = ref.current?.closest<HTMLElement>('[data-slot="dialog-content"]')
    if (!box) return
    const update = () => setVisible(box.scrollHeight - box.scrollTop - box.clientHeight > 8)
    update()
    box.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(box)
    // ponytail: MutationObserver 補抓內容高度變化；scrollHeight 沒有原生事件可監聽
    const mo = new MutationObserver(update)
    mo.observe(box, { childList: true, subtree: true, characterData: true })
    return () => {
      box.removeEventListener('scroll', update)
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none sticky bottom-0 mx-auto -mt-4 h-0">
      {visible ? <ChevronDown className="size-4 -translate-y-5 animate-bounce opacity-50" /> : null}
    </div>
  )
}

export function EventInfoSlot() {
  return (
    <div className="grid gap-3">
      {/* 主視覺圖未定，先留 aspect-video 空位 */}
      <div
        className="flex aspect-video overflow-hidden items-center justify-center rounded-xl border border border-foreground/20 bg-muted/40 text-sm text-muted-foreground"
        aria-hidden
      >
        <img src={weddingImage} alt="wedding" className="w-full h-full object-cover object-[0%_60%]" />
      </div>
      <div className="grid gap-1 text-sm">
        <p>
          <span className="font-medium">時間</span> 12/12 6:00 pm 開始
        </p>
        <p>場內會準備簡單飲食及酒水</p>
        <p className="text-muted-foreground">勿空腹喝酒</p>
        <p className="text-muted-foreground">也請注意：喝酒不開車，開車不喝酒</p>
      </div>
    </div>
  )
}

type LoginFormProps = {
  onGoRegister: () => void
  onSuccess: (email: string) => Promise<void>
}

export function LoginForm({ onGoRegister, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    console.assert(trimmed.length > 0, 'login email required')
    if (!trimmed) return
    setError('')
    setSubmitting(true)
    try {
      await onSuccess(trimmed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '登入失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col justify-between gap-1" onSubmit={handleSubmit}>
      <label className="grid gap-1">
        <span className="text-muted-foreground">Email</span>
        <input
          required
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setError('')
            setEmail(e.target.value)
          }}
          aria-invalid={error ? true : undefined}
          className={fieldClass}
        />
      </label>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <DialogFooter>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? '登入中…' : '登入'}
        </Button>
      </DialogFooter>
      <p className="text-center text-sm text-muted-foreground">
        還沒報名嗎？{' '}
        <button
          type="button"
          className="font-medium text-foreground underline underline-offset-2"
          onClick={onGoRegister}
        >
          立即報名
        </button>
      </p>
    </form>
  )
}

export type RegisterFormValues = {
  realName: string
  nickname: string
  email: string
  drinks: boolean
  diet: string
  /** 同一 email 帳號下的出席人數（含本人），正整數 */
  partySize: number
}

const EMPTY_REGISTER: RegisterFormValues = {
  realName: '',
  nickname: '',
  email: '',
  drinks: false,
  diet: '',
  partySize: 1,
}

type RegisterFormProps = {
  onGoLogin: () => void
  onSuccess: (values: RegisterFormValues) => Promise<void>
}

export function RegisterForm({ onGoLogin, onSuccess }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterFormValues>(EMPTY_REGISTER)
  // 輸入框以字串保存，才能擋空值與小數
  const [partySizeText, setPartySizeText] = useState('1')
  const [nameError, setNameError] = useState('')
  const [partySizeError, setPartySizeError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const realName = form.realName.trim()
    const nickname = form.nickname.trim()
    const email = form.email.trim()
    if (!realName && !nickname) {
      setNameError('真實姓名與綽號請擇一填寫')
      return
    }
    setNameError('')
    const partySize = parsePartySize(partySizeText)
    if (partySize === null) {
      setPartySizeError(`出席人數需為 1 到 ${PARTY_SIZE_MAX} 的整數`)
      return
    }
    setPartySizeError('')
    console.assert(email.length > 0, 'register email required')
    setSubmitError('')
    setSubmitting(true)
    try {
      await onSuccess({
        realName,
        nickname,
        email,
        drinks: form.drinks,
        diet: form.diet.trim(),
        partySize,
      })
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : '報名失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col justify-between gap-1 pb-4" onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <div className="grid gap-1">
          <span className="text-muted-foreground">真實姓名</span>
          <input
            name="realName"
            value={form.realName}
            onChange={(e) => {
              setNameError('')
              setForm((prev) => ({ ...prev, realName: e.target.value }))
            }}
            className={fieldClass}
            aria-describedby="name-either-hint"
          />
        </div>
        <div className="grid gap-1">
          <span className="text-muted-foreground">綽號</span>
          <input
            name="nickname"
            value={form.nickname}
            onChange={(e) => {
              setNameError('')
              setForm((prev) => ({ ...prev, nickname: e.target.value }))
            }}
            className={fieldClass}
            aria-describedby="name-either-hint"
          />
        </div>
        <p id="name-either-hint" className="text-xs text-muted-foreground">
          真實姓名與綽號擇一填寫
        </p>
        {nameError ? (
          <p className="text-xs text-destructive" role="alert">
            {nameError}
          </p>
        ) : null}

        <label className="grid gap-1">
          <span className="text-muted-foreground">
            Email <span className="text-xs">（僅用於登入）</span>
          </span>
          <input
            required
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className={fieldClass}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-muted-foreground">出席人數（含本人）</span>
          <input
            required
            name="partySize"
            type="number"
            inputMode="numeric"
            min={1}
            max={PARTY_SIZE_MAX}
            step={1}
            value={partySizeText}
            onChange={(e) => {
              setPartySizeError('')
              setPartySizeText(e.target.value)
            }}
            aria-invalid={partySizeError ? true : undefined}
            aria-describedby="party-size-hint"
            className={fieldClass}
          />
          <span id="party-size-hint" className="text-xs text-muted-foreground">
            1 到 {PARTY_SIZE_MAX} 人，共用這個 Email
          </span>
        </label>
        {partySizeError ? (
          <p className="text-xs text-destructive" role="alert">
            {partySizeError}
          </p>
        ) : null}

        <fieldset className="grid gap-2">
          <legend className="text-muted-foreground">是否喝酒</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="drinks"
                checked={form.drinks === true}
                onChange={() => setForm((prev) => ({ ...prev, drinks: true }))}
              />
              會喝
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="drinks"
                checked={form.drinks === false}
                onChange={() => setForm((prev) => ({ ...prev, drinks: false }))}
              />
              不喝
            </label>
          </div>
        </fieldset>

        <label className="grid gap-1">
          <span className="text-muted-foreground">飲食禁忌</span>
          <input
            name="diet"
            value={form.diet}
            onChange={(e) => setForm((prev) => ({ ...prev, diet: e.target.value }))}
            placeholder="沒有可留空"
            className={fieldClass}
          />
        </label>
      </div>

      {submitError ? (
        <p className="text-xs text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}
      <DialogFooter>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? '報名中…' : '報名'}
        </Button>
      </DialogFooter>
      <p className="text-center text-sm text-muted-foreground">
        已經報名過了？{' '}
        <button
          type="button"
          className="font-medium text-foreground underline underline-offset-2"
          onClick={onGoLogin}
        >
          立即登入
        </button>
      </p>
      <ScrollHint />
    </form>
  )
}
