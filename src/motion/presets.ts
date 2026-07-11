import type { Transition } from "motion/react";

/** 全站 spring 手感單一來源 — 調手感只改這裡(polish design Decision 2) */
export const springSnappy: Transition = { type: "spring", stiffness: 400, damping: 30 };
export const springSoft: Transition = { type: "spring", stiffness: 300, damping: 25 };
