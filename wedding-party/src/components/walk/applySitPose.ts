import type { PoseRefs, SitDims } from './types'

const LEAN_BACK = - Math.PI / 10 // 上身後傾 15°
const LEG_FORWARD = Math.PI / 2 // 雙腿向前伸直
const ARM_DOWN = Math.PI / 8 // 雙手向後撐地
const ARM_OUTWARD = 0.28 // 手尖外展
export const SIT_HIP_FORWARD = 4 // 大腿軸相對預設髖位前移（× limbR）
export const SIT_SHOULDER_INSET = 0.72 // 坐姿肩膀橫向內收（× shoulderX）

export function applySitPose(refs: PoseRefs, { hipY, limbR }: SitDims) {
  const { characterRef, bodyRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef } = refs

  const sitHipY = limbR * 1.2
  if (characterRef.current) {
    characterRef.current.position.y = sitHipY - hipY
  }
  if (bodyRef.current) {
    bodyRef.current.position.y = 0
    bodyRef.current.rotation.x = LEAN_BACK
  }
  if (leftLegRef.current) {
    leftLegRef.current.rotation.x = LEG_FORWARD
    leftLegRef.current.position.y = 0
  }
  if (rightLegRef.current) {
    rightLegRef.current.rotation.x = LEG_FORWARD
    rightLegRef.current.position.y = 0
  }
  if (leftArmRef.current) {
    leftArmRef.current.rotation.x = ARM_DOWN
    leftArmRef.current.rotation.z = -ARM_OUTWARD
  }
  if (rightArmRef.current) {
    rightArmRef.current.rotation.x = ARM_DOWN
    rightArmRef.current.rotation.z = ARM_OUTWARD
  }

  // ponytail: 靜態姿勢；坐下高度用 sitHipY 近似，未做腳尖著地校正
}
