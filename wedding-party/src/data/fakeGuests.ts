import { FACE_IDS, type FaceId } from '../components/beanFace'
import type { Body } from '../types/body'

export type FakeGuest = {
  id: string
  name: string
  /** 臉型選擇 */
  face: FaceId
  /** 想說的一句話（先存資料，尚未接顯示） */
  say: string
  body: Body
  
}

const NAMES = [
  '阿明', '小美', '大偉', '小芳', '志豪', '雅婷', '冠宇', '佳玲', '俊傑', '怡君',
  '建宏', '淑芬', '家豪', '佩君', '宗憲', '婉婷', '正雄', '詩涵', '彥廷', '宜蓁',
  '子軒', '昱廷', '語萱', '承恩', '芯語', '柏翰', '子晴', '宇恩', '品璉', '恩齊',
]

const SAYS = [
  '新婚快樂！',
  '願你們永遠甜甜蜜蜜',
  '今天舞池是我的',
  '早日生個小豆仁',
  '份子錢我有帶喔',
  '祝百年好合',
  '記得丟捧花給我',
  '吃飽再跳舞',
  '這場一定錄起來',
  '恭喜恭喜！',
  '來來來乾杯',
  '新娘超美的',
  '新郎加油別緊張',
  '我是來吃喜酒的',
  '婚禮比想像中好玩',
  '晚上再開一場',
  '愛妳們兩個',
  '拍好多張再走',
  '終於等到這天',
  '幸福歐賣尬',
  '豆仁造型讚讚',
  '下次換我辦',
  '座位我選好了',
  '麥克風借我一下',
  '祝福永遠相愛',
  '大家一起蹦迪',
  '禮服也太正式',
  '甜點我先訂了',
  '宴後半場見',
  '永結同心！',
]

export const FAKE_GUESTS: FakeGuest[] = NAMES.map((name, i) => {
  const face = FACE_IDS[i % FACE_IDS.length]!
  const headSize = 0.85 + ((i * 7) % 8) * 0.05
  return {
    id: `guest-${i + 1}`,
    name,
    face,
    say: SAYS[i]!,
    body: { face, headSize },
  }
})

console.assert(FAKE_GUESTS.length === 30, `expected 30 guests, got ${FAKE_GUESTS.length}`)
console.assert(
  FAKE_GUESTS.every((g) => g.face === g.body.face && g.say.length > 0),
  'each guest needs face + say',
)
