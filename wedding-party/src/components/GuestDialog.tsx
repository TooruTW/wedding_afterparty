import { useState } from 'react'
import { User } from 'lucide-react'
import { Tabs } from 'radix-ui'
import {
  draftLabel,
  makeDrafts,
  updateDraft,
  type Draft,
} from '../lib/characterDrafts'
import {
  EventInfoSlot,
  LoginForm,
  RegisterForm,
  type RegisterFormValues,
} from './AuthForms'
import { EMPTY_GUEST_FORM, GuestForm, type GuestFormValues } from './GuestForm'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

/** ponytail: CSS bottom-sheet instead of vaul; upgrade if drag-to-dismiss is needed */
const PANEL_BASE =
  'h-full overflow-y-auto [transition-property:max-height,max-width] duration-300 ease-in-out [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-sm:top-auto max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:data-open:slide-in-from-bottom-4 max-sm:data-open:zoom-in-100 max-sm:data-closed:slide-out-to-bottom-4 max-sm:data-closed:zoom-out-100'

type DialogPage = 'login' | 'register' | 'guest'

const PAGE_MAX_H: Record<DialogPage, string> = {
  login: 'max-h-140',
  register: 'max-h-180',
  guest: 'max-h-120',
}

type GuestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (guests: GuestFormValues[]) => Promise<void>
  onLogin: (email: string) => Promise<GuestFormValues[]>
  onRegister: (values: RegisterFormValues) => Promise<GuestFormValues[]>
  onLogout: () => void
  /** 登入後帶入自己的角色；未登入時為空 */
  seedGuests?: GuestFormValues[]
}

const PAGE_TITLE: Record<DialogPage, string> = {
  login: '登入',
  register: '報名',
  guest: '角色設定',
}

function isDraftComplete(values: GuestFormValues) {
  return values.name.trim().length > 0 && values.say.trim().length > 0
}

export function GuestDialog({
  open,
  onOpenChange,
  onSubmit,
  onLogin,
  onRegister,
  onLogout,
  seedGuests,
}: GuestDialogProps) {
  function seededDrafts(): Draft<GuestFormValues>[] {
    return (seedGuests ?? []).map((values) => ({ id: crypto.randomUUID(), values }))
  }

  const initialDrafts = seededDrafts()
  const [page, setPage] = useState<DialogPage>(initialDrafts.length ? 'guest' : 'login')
  const [drafts, setDrafts] = useState<Draft<GuestFormValues>[]>(initialDrafts)
  const [selectedId, setSelectedId] = useState(initialDrafts[0]?.id ?? '')
  const [submitError, setSubmitError] = useState('')
  const [saving, setSaving] = useState(false)

  // 開啟的瞬間才用當下的 seedGuests 重建草稿；App 會在翻開前先重抓後端
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      const seeded = seededDrafts()
      setPage(seeded.length ? 'guest' : 'login')
      setDrafts(seeded)
      setSelectedId(seeded[0]?.id ?? '')
      setSubmitError('')
    }
  }

  const selected = drafts.find((d) => d.id === selectedId)

  async function handleLogin(email: string) {
    const values = await onLogin(email)
    const next =
      values.length > 0
        ? values.map((value) => ({ id: crypto.randomUUID(), values: value }))
        : makeDrafts(1, () => ({ ...EMPTY_GUEST_FORM }))
    setDrafts(next)
    setSelectedId(next[0]!.id)
    setSubmitError('')
    setPage('guest')
  }

  async function handleRegister(values: RegisterFormValues) {
    const seeded = await onRegister(values)
    const next = seeded.map((value) => ({ id: crypto.randomUUID(), values: value }))
    setDrafts(next)
    setSelectedId(next[0]!.id)
    setSubmitError('')
    setPage('guest')
  }

  function handleLogout() {
    onLogout()
    setDrafts([])
    setSelectedId('')
    setSubmitError('')
    setPage('login')
  }

  function handleFormChange(values: GuestFormValues) {
    setSubmitError('')
    setDrafts((prev) => updateDraft(prev, selectedId, values))
  }

  /** GuestForm 只驗證目前分頁；這裡先存回目前值，再驗證所有草稿後一次送出 */
  async function handleFormSubmit(current: GuestFormValues) {
    const all = updateDraft(drafts, selectedId, current)
    setDrafts(all)
    const incomplete = all.find((d) => !isDraftComplete(d.values))
    if (incomplete) {
      setSelectedId(incomplete.id)
      setSubmitError('還有角色未完成，請補齊名字與想說的話')
      return
    }
    setSaving(true)
    setSubmitError('')
    try {
      await onSubmit(all.map((d) => d.values))
    } catch (cause) {
      setSubmitError(cause instanceof Error ? cause.message : '儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon-lg"
          className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-md"
          aria-label="開啟對話框"
        >
          <User className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          PANEL_BASE,
          PAGE_MAX_H[page],
          page === 'guest' ? 'sm:max-w-2xl' : 'sm:max-w-md',
        )}
      >
        <DialogHeader>
          <DialogTitle>{PAGE_TITLE[page]}</DialogTitle>
        </DialogHeader>

        {page === 'login' || page === 'register' ? <EventInfoSlot /> : null}

        {page === 'login' ? (
          <LoginForm onGoRegister={() => setPage('register')} onSuccess={handleLogin} />
        ) : null}

        {page === 'register' ? (
          <RegisterForm onGoLogin={() => setPage('login')} onSuccess={handleRegister} />
        ) : null}

        {page === 'guest' && selected ? (
          <Tabs.Root value={selectedId} onValueChange={setSelectedId} className="grid gap-3">
            {drafts.length > 1 ? (
              <Tabs.List aria-label="切換角色" className="flex flex-wrap gap-1">
                {drafts.map((draft, index) => (
                  <Tabs.Trigger
                    key={draft.id}
                    value={draft.id}
                    className="rounded-lg border border-transparent px-2.5 py-1 text-sm text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=active]:bg-muted data-[state=active]:font-medium data-[state=active]:text-foreground"
                  >
                    {draftLabel(draft.values.name, index)}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
            ) : null}

            <Tabs.Content value={selectedId} className="grid gap-3 outline-none" tabIndex={-1}>
              <GuestForm
                key={selectedId}
                value={selected.values}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                submitting={saving}
              />
              {submitError ? (
                <p className="text-xs text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mx-auto text-muted-foreground"
                onClick={handleLogout}
              >
                登出
              </Button>
            </Tabs.Content>
          </Tabs.Root>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
