import type { FaceId } from '../body/beanFace'
import type { Body } from '../types/body'

export type FakeGuest = {
  id: string
  name: string
  /** 臉型選擇 */
  face: FaceId
  /** 想說的一句話（chat 時用 Sprite 顯示） */
  say: string
  body: Body
}

export const FAKE_GUESTS: FakeGuest[] = [
  { id: 'guest-1', name: '阿明', face: 'bars', say: '新婚快樂！', body: { face: 'bars', headSize: 0.85 } },
  { id: 'guest-2', name: '小美', face: 'dots', say: '願你們永遠甜甜蜜蜜', body: { face: 'dots', headSize: 1.2 } },
  { id: 'guest-3', name: '大偉', face: 'ovals', say: '今天舞池是我的', body: { face: 'ovals', headSize: 1.15 } },
  { id: 'guest-4', name: '小芳', face: 'bars', say: '早日生個小豆仁', body: { face: 'bars', headSize: 1.1 } },
  { id: 'guest-5', name: '志豪', face: 'dots', say: '份子錢我有帶喔', body: { face: 'dots', headSize: 1.05 } },
  { id: 'guest-6', name: '雅婷', face: 'ovals', say: '祝百年好合', body: { face: 'ovals', headSize: 1 } },
  { id: 'guest-7', name: '冠宇', face: 'bars', say: '記得丟捧花給我', body: { face: 'bars', headSize: 0.95 } },
  { id: 'guest-8', name: '佳玲', face: 'dots', say: '吃飽再跳舞', body: { face: 'dots', headSize: 0.9 } },
  { id: 'guest-9', name: '俊傑', face: 'ovals', say: '這場一定錄起來', body: { face: 'ovals', headSize: 0.85 } },
  { id: 'guest-10', name: '怡君', face: 'bars', say: '恭喜恭喜！', body: { face: 'bars', headSize: 1.2 } },
  { id: 'guest-11', name: '建宏', face: 'dots', say: '來來來乾杯', body: { face: 'dots', headSize: 1.15 } },
  { id: 'guest-12', name: '淑芬', face: 'ovals', say: '新娘超美的', body: { face: 'ovals', headSize: 1.1 } },
  { id: 'guest-13', name: '家豪', face: 'bars', say: '新郎加油別緊張', body: { face: 'bars', headSize: 1.05 } },
  { id: 'guest-14', name: '佩君', face: 'dots', say: '我是來吃喜酒的', body: { face: 'dots', headSize: 1 } },
  { id: 'guest-15', name: '宗憲', face: 'ovals', say: '婚禮比想像中好玩', body: { face: 'ovals', headSize: 0.95 } },
  { id: 'guest-16', name: '婉婷', face: 'bars', say: '晚上再開一場', body: { face: 'bars', headSize: 0.9 } },
  { id: 'guest-17', name: '正雄', face: 'dots', say: '愛妳們兩個', body: { face: 'dots', headSize: 0.85 } },
  { id: 'guest-18', name: '詩涵', face: 'ovals', say: '拍好多張再走', body: { face: 'ovals', headSize: 1.2 } },
  { id: 'guest-19', name: '彥廷', face: 'bars', say: '終於等到這天', body: { face: 'bars', headSize: 1.15 } },
  { id: 'guest-20', name: '宜蓁', face: 'dots', say: '幸福歐賣尬', body: { face: 'dots', headSize: 1.1 } },
  { id: 'guest-21', name: '子軒', face: 'ovals', say: '豆仁造型讚讚', body: { face: 'ovals', headSize: 1.05 } },
  { id: 'guest-22', name: '昱廷', face: 'bars', say: '下次換我辦', body: { face: 'bars', headSize: 1 } },
  { id: 'guest-23', name: '語萱', face: 'dots', say: '座位我選好了', body: { face: 'dots', headSize: 0.95 } },
  { id: 'guest-24', name: '承恩', face: 'ovals', say: '麥克風借我一下', body: { face: 'ovals', headSize: 0.9 } },
  { id: 'guest-25', name: '芯語', face: 'bars', say: '祝福永遠相愛', body: { face: 'bars', headSize: 0.85 } },
  { id: 'guest-26', name: '柏翰', face: 'dots', say: '大家一起蹦迪', body: { face: 'dots', headSize: 1.2 } },
  { id: 'guest-27', name: '子晴', face: 'ovals', say: '禮服也太正式', body: { face: 'ovals', headSize: 1.15 } },
  { id: 'guest-28', name: '宇恩', face: 'bars', say: '甜點我先訂了', body: { face: 'bars', headSize: 1.1 } },
  { id: 'guest-29', name: '品璉', face: 'dots', say: '宴後半場見', body: { face: 'dots', headSize: 1.05 } },
  { id: 'guest-30', name: '恩齊', face: 'ovals', say: '永結同心！', body: { face: 'ovals', headSize: 1 } },
]

console.assert(FAKE_GUESTS.length === 30, `expected 30 guests, got ${FAKE_GUESTS.length}`)
console.assert(
  FAKE_GUESTS.every((g) => g.face === g.body.face && g.say.length > 0),
  'each guest needs face + say',
)
