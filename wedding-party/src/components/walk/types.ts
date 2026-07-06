import type { RefObject } from "react";

export type WalkStyle = "normal" | "frenzy";

export type Pose = "stand" | "sit";

export type SitDims = {
  hipY: number;
  limbR: number;
};

export type PoseRefs = UpperBodyRefs & {
  leftLegRef: RefObject<Pivot | null>;
  rightLegRef: RefObject<Pivot | null>;
};

export type Pivot = {
  rotation: { x: number; y?: number; z: number };
  position: { y: number; z?: number };
};

export type WalkCycle = {
  swing: number;
  bob: number;
  cos: number;
};

export type UpperBodyRefs = {
  characterRef: RefObject<Pivot | null>;
  bodyRef: RefObject<Pivot | null>;
  leftArmRef: RefObject<Pivot | null>;
  rightArmRef: RefObject<Pivot | null>;
};
