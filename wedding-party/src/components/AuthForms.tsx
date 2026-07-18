import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'

export const fieldClass =
  'h-9 w-full rounded-lg border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function EventInfoSlot() {
  return (
    <div className="grid gap-3">
      {/* 主視覺圖未定，先留 aspect-video 空位 */}
      <div
        className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-foreground/20 bg-muted/40 text-sm text-muted-foreground"
        aria-hidden
      >
        活動圖片
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
  onSuccess: () => void
}

export function LoginForm({ onGoRegister, onSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = phone.trim()
    console.assert(trimmed.length > 0, 'login phone required')
    if (!trimmed) return
    // ponytail: 尚無後端；先通過驗證就進下一頁
    onSuccess()
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-1">
        <span className="text-muted-foreground">手機號碼</span>
        <input
          required
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
        />
      </label>
      <DialogFooter>
        <Button type="submit" className="w-full sm:w-auto">
          登入
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
  phone: string
  drinks: boolean
  diet: string
}

const EMPTY_REGISTER: RegisterFormValues = {
  realName: '',
  nickname: '',
  phone: '',
  drinks: false,
  diet: '',
}

type RegisterFormProps = {
  onGoLogin: () => void
  onSuccess: (values: RegisterFormValues) => void
}

export function RegisterForm({ onGoLogin, onSuccess }: RegisterFormProps) {
  const [form, setForm] = useState<RegisterFormValues>(EMPTY_REGISTER)
  const [nameError, setNameError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const realName = form.realName.trim()
    const nickname = form.nickname.trim()
    const phone = form.phone.trim()
    if (!realName && !nickname) {
      setNameError('真實姓名與綽號請擇一填寫')
      return
    }
    setNameError('')
    console.assert(phone.length > 0, 'register phone required')
    onSuccess({
      realName,
      nickname,
      phone,
      drinks: form.drinks,
      diet: form.diet.trim(),
    })
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
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
          <span className="text-muted-foreground">手機號碼</span>
          <input
            required
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            className={fieldClass}
          />
        </label>

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

      <DialogFooter>
        <Button type="submit" className="w-full sm:w-auto">
          報名
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
    </form>
  )
}
