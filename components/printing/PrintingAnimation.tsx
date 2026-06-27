"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SketchButton } from "@/components/ui/SketchButton";

interface PrintingAnimationProps {
  blob: Blob;
  onComplete: () => void;
}

export function PrintingAnimation({ blob, onComplete }: PrintingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const reduceMotion = useReducedMotion();
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    const duration = reduceMotion ? 240 : 3200;
    const started = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const next = Math.min(100, ((time - started) / duration) * 100);
      setProgress(next);
      if (next < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); };
  }, [reduceMotion, url]);

  const status = progress < 30 ? "Warming the rollers…" : progress < 72 ? "Laying down the ink…" : progress < 100 ? "A little more paper…" : "Fresh from the booth!";

  return (
    <section className="screen-card max-w-3xl text-center" aria-labelledby="printing-title">
      <p className="eyebrow">Clunk · whirr · shuffle</p>
      <h1 id="printing-title" className="screen-title">Your strip is printing.</h1>
      <p className="mt-2 min-h-6 font-hand font-bold" aria-live="polite">{status}</p>
      <div className="printer mx-auto mt-8">
        <div className="printer-top"><span className="printer-light" /></div>
        <div className="printer-slot" />
        <div className="strip-clip">
          <motion.img
            src={url}
            alt="Your printed photo strip"
            className="printed-strip"
            animate={{ transform: `translateY(${Math.max(-95, -95 + progress * 0.95)}%) rotate(${progress < 100 ? -0.7 : 0.6}deg)` }}
            transition={{ ease: "linear", duration: 0.12 }}
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-4">
        {progress >= 100 && <SketchButton tone="rust" onClick={onComplete}>Pull out my strip</SketchButton>}
      </div>
    </section>
  );
}
