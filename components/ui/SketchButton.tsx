"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface SketchButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  tone?: "ink" | "paper" | "rust";
  full?: boolean;
}

export function SketchButton({ children, tone = "ink", full = false, className = "", ...props }: SketchButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", duration: 0.16, bounce: 0.1 }}
      className={`sketch-button sketch-button--${tone} ${full ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
