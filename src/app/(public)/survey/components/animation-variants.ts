import type { Target, TargetAndTransition, Transition } from "framer-motion";

export type MotionVariants = {
  [key: string]: Target | TargetAndTransition & {
    transition?: Transition;
  };
};

export const container: MotionVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const item: MotionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};