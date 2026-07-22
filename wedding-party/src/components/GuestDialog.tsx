import { useState } from 'react'
import { User } from 'lucide-react'
import { Tabs } from 'radix-ui'
import {
  draftLabel,
  makeDrafts,
  removeDraft,
  updateDraft,
  type Draft,
} from '../lib/characterDrafts'
import { EventInfoSlot, LoginForm, RegisterForm } from './AuthForms'
import { EMPTY_GUEST_FORM, GuestForm, type GuestFormValues } from './GuestForm'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

type DialogPage = 'login' | 'register' | 'guest'

type GuestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (guests: GuestFormValues[]) => void
}

const PAGE_TITLE: Record<DialogPage, string> = {
  login: '登入',
  register: '報名',
  guest: '角色設定',
}

function isDraftComplete(values: GuestFormValues) {
  return values.name.trim().length > 0 && values.say.trim().length > 0
}

export function GuestDialog({ open, onOpenChange, onSubmit }: GuestDialogProps) {
  const [page, setPage] = useState<DialogPage>('login')
  const [drafts, setDrafts] = useState<Draft<GuestFormValues>[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const selected = drafts.find((d) => d.id === selectedId)

  function startGuestPage(partySize: number) {
    const next = makeDrafts(partySize, () => ({ ...EMPTY_GUEST_FORM }))
    setDrafts(next)
    setSelectedId(next[0]!.id)
    setSubmitError('')
    setPage('guest')
  }

  function resetAndClose(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (nextOpen) {
      setPage('login')
      setDrafts([])
      setSelectedId('')
      setConfirmOpen(false)
      setSubmitError('')
    }
  }

  function handleFormChange(values: GuestFormValues) {
    setSubmitError('')
    setDrafts((prev) => updateDraft(prev, selectedId, values))
  }

  /** GuestForm 只驗證目前分頁；這裡先存回目前值，再驗證所有草稿後一次送出 */
  function handleFormSubmit(current: GuestFormValues) {
    const all = updateDraft(drafts, selectedId, current)
    setDrafts(all)
    const incomplete = all.find((d) => !isDraftComplete(d.values))
    if (incomplete) {
      setSelectedId(incomplete.id)
      setSubmitError('還有角色未完成，請補齊名字與想說的話')
      return
    }
    onSubmit(all.map((d) => d.values))
  }

  function handleDeleteConfirmed() {
    const result = removeDraft(drafts, selectedId)
    setDrafts(result.drafts)
    setSelectedId(result.selectedId)
    setConfirmOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogTrigger asChild>
        <Button
          size="icon-lg"
          className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-md"
          aria-label="開啟對話框"
        >
          <User className="size-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className={page === 'guest' ? 'sm:max-w-2xl' : 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>{PAGE_TITLE[page]}</DialogTitle>
        </DialogHeader>

        {page === 'login' || page === 'register' ? <EventInfoSlot /> : null}

        {page === 'login' ? (
          <LoginForm onGoRegister={() => setPage('register')} onSuccess={() => startGuestPage(1)} />
        ) : null}

        {page === 'register' ? (
          <RegisterForm
            onGoLogin={() => setPage('login')}
            onSuccess={(values) => startGuestPage(values.partySize)}
          />
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
              />
              {submitError ? (
                <p className="text-xs text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}

              {drafts.length > 1 ? (
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-self-center text-muted-foreground"
                    >
                      刪除這位角色
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>
                        刪除「{draftLabel(selected.values.name, drafts.indexOf(selected))}」？
                      </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      這位角色的設定會被移除，無法復原。
                    </p>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                        取消
                      </Button>
                      <Button type="button" variant="destructive" onClick={handleDeleteConfirmed}>
                        確認刪除
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </Tabs.Content>
          </Tabs.Root>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
