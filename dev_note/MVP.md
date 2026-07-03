# Afterparty 活動登入站 — MVP 筆記

## 定位

活動登入 + 參加名單。副產品：3D 豆子人舞池（程式生成，不用模型）。

## 技術

- Vite + React
- Three：`@react-three/fiber` + `drei`
- 幾何體：Sphere / Capsule / Box，部位獨立 `scale`
- 動畫：程序化 `sin`，不用動畫檔
- 材質：`MeshBasicMaterial`（輕量）
- 資料：先 `localStorage`；多人同步再加 Supabase

## 開發順序

**Three 先做 → HTML 後補**

---

## Three.js

### P1 — BeanPerson

- [ ] Canvas / R3F 環境
- [ ] `body` props 型別 + JSON 結構
- [ ] 部位 mesh：頭 / 軀幹 / 胸 / 屁股 / 肩 / 臂 / 手 / 腿 / 腳
- [ ] group 階層（關節 pivot）
- [ ] 共用 geometry
- [ ] 硬編碼 body 測試

### P2 — 捏人預覽

- [ ] slider / leva 接 props（暫代表單）
- [ ] OrbitControls
- [ ] 顏色 props

### P3 — 舞步

- [ ] `useFrame` 擺動
- [ ] 舞種：迪斯可 / 機器人 / 抖臀
- [ ] `dance` prop 切換

### P4 — 舞池

- [ ] 地板
- [ ] AmbientLight + PointLight（可變色）
- [ ] 固定攝影機
- [ ] 多人 spawn + 站位
- [ ] 名字標籤（sprite 或 HTML overlay）

### P5 — 收尾

- [ ] wobble（胸 / 屁股 / 手）
- [ ] 隨機ㄎㄧㄤ body 產生器

---

## HTML

### P1 — 專案殼

- [ ] Vite + React 頁面架構
- [ ] 路由或分頁：登入 / 舞池

### P2 — 表單

- [ ] 姓名
- [ ] body sliders
- [ ] 顏色
- [ ] 舞種選擇
- [ ] 送出

### P3 — 名單

- [ ] localStorage CRUD
- [ ] 參加者列表 UI

### P4 — 整合

- [ ] 表單 state → `<BeanPerson />` props
- [ ] 登入頁：表單 + Canvas 預覽並排
- [ ] 舞池頁：讀名單 → spawn

### P5 — 可選

- [ ] Supabase 即時同步

---

## 不做

Unity / 外部模型 / Mixamo / 捏臉細節 / 即時操控 / 後製特效 / 陰影

## body JSON

```json
{
  "height": 1.2,
  "head": 2.8,
  "shoulder": 1.5,
  "armLength": 3.5,
  "hand": 1.8,
  "chest": 2.5,
  "butt": 3.0,
  "foot": 1.2,
  "color": "#FF00FF"
}
```
