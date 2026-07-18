import { useState } from 'react'
import { User } from 'lucide-react'
import { EventInfoSlot, LoginForm, RegisterForm } from './AuthForms'
import { EMPTY_GUEST_FORM, GuestForm, type GuestFormValues } from './GuestForm'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'

type DialogPage = 'login' | 'register' | 'guest'

type GuestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (guest: GuestFormValues) => void
}

const PAGE_TITLE: Record<DialogPage, string> = {
  login: '登入',
  register: '報名',
  guest: '加入賓客',
}

export function GuestDialog({ open, onOpenChange, onSubmit }: GuestDialogProps) {
  const [page, setPage] = useState<DialogPage>('login')
  const [form, setForm] = useState<GuestFormValues>(EMPTY_GUEST_FORM)

  function resetAndClose(nextOpen: boolean) {
    onOpenChange(nextOpen)
    if (nextOpen) {
      setPage('login')
      setForm(EMPTY_GUEST_FORM)
    }
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
          <LoginForm onGoRegister={() => setPage('register')} onSuccess={() => setPage('guest')} />
        ) : null}

        {page === 'register' ? (
          <RegisterForm
            onGoLogin={() => setPage('login')}
            onSuccess={() => setPage('guest')}
          />
        ) : null}

        {page === 'guest' ? (
          <GuestForm value={form} onChange={setForm} onSubmit={onSubmit} />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
