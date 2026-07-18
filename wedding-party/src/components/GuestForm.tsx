import { Canvas } from '@react-three/fiber'
import type { FormEvent } from 'react'
import { BeanPerson } from '../body/BeanPerson'
import { FACE_IDS, type FaceId } from '../body/beanFace'
import type { FakeGuest } from '../data/fakeGuests'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'

/** 表單欄位 = FakeGuest 去掉 id；face 與 body.face 同一欄 */
export type GuestFormValues = Omit<FakeGuest, 'id'>

export const EMPTY_GUEST_FORM: GuestFormValues = {
  name: '',
  face: 'dots',
  say: '',
  body: { face: 'dots', headSize: 1 },
}

const FACE_LABELS: Record<FaceId, string> = {
  bars: '長條眼',
  dots: '圓點眼',
  ovals: '橢圓眼',
}

const NAME_MAX = 10
const SAY_MAX = 20

const fieldClass =
  'h-9 rounded-lg border border-input bg-transparent px-3 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

type GuestFormProps = {
  value: GuestFormValues
  onChange: (next: GuestFormValues) => void
  onSubmit: (guest: GuestFormValues) => void
}

export function GuestForm({ value, onChange, onSubmit }: GuestFormProps) {
  function setFace(face: FaceId) {
    onChange({ ...value, face, body: { ...value.body, face } })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const guest: GuestFormValues = {
      name: value.name.trim().slice(0, NAME_MAX),
      face: value.face,
      say: value.say.trim().slice(0, SAY_MAX),
      body: { face: value.face, headSize: value.body.headSize },
    }
    console.assert(
      guest.face === guest.body.face && guest.name.length > 0 && guest.say.length > 0,
      'guest form incomplete',
    )
    onSubmit(guest)
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
      <div className="grid gap-3 content-start">
        <label className="grid gap-1">
          <span className="flex justify-between text-muted-foreground">
            名字
            <span className="tabular-nums">
              {value.name.length}/{NAME_MAX}
            </span>
          </span>
          <input
            required
            name="name"
            maxLength={NAME_MAX}
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value.slice(0, NAME_MAX) })}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-muted-foreground">臉型</span>
          <select
            name="face"
            value={value.face}
            onChange={(e) => setFace(e.target.value as FaceId)}
            className={fieldClass}
          >
            {FACE_IDS.map((id) => (
              <option key={id} value={id}>
                {FACE_LABELS[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="flex justify-between text-muted-foreground">
            想說的話
            <span className="tabular-nums">
              {value.say.length}/{SAY_MAX}
            </span>
          </span>
          <input
            required
            name="say"
            maxLength={SAY_MAX}
            value={value.say}
            onChange={(e) => onChange({ ...value, say: e.target.value.slice(0, SAY_MAX) })}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-1">
          <span className="flex justify-between text-muted-foreground">
            頭大小
            <span className="tabular-nums text-foreground">{value.body.headSize.toFixed(2)}</span>
          </span>
          <input
            type="range"
            name="headSize"
            min={0.5}
            max={2}
            step={0.05}
            value={value.body.headSize}
            onChange={(e) =>
              onChange({
                ...value,
                body: { ...value.body, headSize: Number(e.target.value) },
              })
            }
            className="h-9 w-full accent-primary"
          />
        </label>
      </div>

      <div className="relative h-72 overflow-hidden rounded-xl bg-sky-100 ring-1 ring-foreground/10 sm:min-h-80 sm:h-full">
        <Canvas
          camera={{ position: [0, 0.3, 4.6], fov: 40 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <color attach="background" args={['#e0f2fe']} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[4, 8, 3]} intensity={1} />
          {/* ponytail: 豆人往下移置中取景；相機預設看原點，不用 OrbitControls */}
          <BeanPerson
            body={value.body}
            name={value.name || '名字'}
            say={value.say || undefined}
            pose="stand"
            position={[0, -1.15, 0]}
          />
        </Canvas>
      </div>

      <DialogFooter className="sm:col-span-2">
        <Button type="submit">送出</Button>
      </DialogFooter>
    </form>
  )
}
