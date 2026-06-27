"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Images, Palette, RefreshCcw, Scissors, Share2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { canvasToBlob, renderIndividualPhoto, renderStripCanvas } from "@/lib/canvas";
import { downloadBlob, stripFilename } from "@/lib/download";
import { shareStrip } from "@/lib/share";
import type { PhotoItem, StripOptions } from "@/types/photo";
import { SketchButton } from "@/components/ui/SketchButton";

interface ResultScreenProps {
  blob: Blob;
  photos: PhotoItem[];
  options: StripOptions;
  onCustomize: () => void;
  onStartOver: () => void;
}

export function ResultScreen({ blob, photos, options, onCustomize, onStartOver }: ResultScreenProps) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  const [cutting, setCutting] = useState(false);
  const [cuts, setCuts] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [individualFiles, setIndividualFiles] = useState<File[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  useEffect(() => {
    let active = true;
    Promise.all(photos.map(async (photo, index) => {
      const image = await renderIndividualPhoto(photo, options.filter);
      return new File([image], `sketchsnap-photo-${index + 1}.png`, { type: "image/png" });
    })).then((files) => {
      if (active) setIndividualFiles(files);
    }).catch(() => {
      if (active) setMessage("The individual photos could not be prepared.");
    });
    return () => { active = false; };
  }, [photos, options.filter]);

  const downloadJpeg = async () => {
    try {
      const canvas = await renderStripCanvas(photos, options, "image/jpeg");
      downloadBlob(await canvasToBlob(canvas, "image/jpeg", 0.92), stripFilename("jpg"));
      setMessage("JPEG saved.");
    } catch {
      setMessage("The JPEG could not be created. Please try PNG.");
    }
  };

  const downloadIndividuals = async () => {
    if (individualFiles.length !== 4) {
      setMessage("The individual photos are still being prepared.");
      return;
    }
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: individualFiles }))) {
        await navigator.share({ title: "Your four SketchSnap photos", files: individualFiles });
        setMessage("Four individual photos shared.");
        return;
      }
      individualFiles.forEach((file) => downloadBlob(file, file.name));
      setMessage("Four individual photos saved.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("One of the individual photos could not be saved.");
    }
  };

  const share = async () => {
    try {
      const result = await shareStrip(blob);
      setMessage(result === "shared" ? "Shared!" : "Share message copied. You can download the strip below.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing is unavailable here. Your download still works.");
    }
  };

  const cut = (line: number) => {
    setCuts((current) => current.includes(line) ? current : [...current, line]);
    setMessage(`Cut ${line} of 3 made. ${line === 3 ? "Your four frames are ready to save." : ""}`);
  };

  return (
    <section className="result-shell" aria-labelledby="result-title">
      <div className="result-copy">
        <p className="eyebrow">Still a little warm</p>
        <h1 id="result-title" className="screen-title">That one&apos;s a keeper.</h1>
        <p className="mt-3 max-w-md text-ink/70">Save the whole strip, share it, or snip the frames apart. Your original photos still haven&apos;t left this browser.</p>
        <p className="mt-4 min-h-6 font-semibold text-rust" role="status" aria-live="polite">{message}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SketchButton tone="rust" onClick={() => { downloadBlob(blob, stripFilename()); setMessage("PNG saved."); }}><Download size={19} /> Download PNG</SketchButton>
          <SketchButton tone="paper" onClick={downloadJpeg}><Download size={19} /> Download JPEG</SketchButton>
          <SketchButton tone="paper" onClick={share}><Share2 size={19} /> Share strip</SketchButton>
          <SketchButton tone="paper" onClick={downloadIndividuals} disabled={individualFiles.length !== 4}><Images size={19} /> {individualFiles.length === 4 ? "Save 4 photos" : "Preparing photos…"}</SketchButton>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          <button className="text-link inline-flex items-center gap-2" onClick={() => { setCutting(!cutting); setCuts([]); }}><Scissors size={17} /> {cutting ? "Put scissors away" : "Cut the strip"}</button>
          <button className="text-link inline-flex items-center gap-2" onClick={onCustomize}><Palette size={17} /> Change frame</button>
          <button className="text-link inline-flex items-center gap-2" onClick={onStartOver}><RefreshCcw size={17} /> Start over</button>
        </div>
      </div>

      <div className={`cutting-board ${cutting ? "cutting-board--active" : ""}`}>
        <motion.div
          className="relative mx-auto w-[min(58vw,290px)]"
          animate={{ transform: cutting && !reduceMotion ? "rotate(-1deg) scale(1.02)" : "rotate(.7deg) scale(1)" }}
        >
          {/* Canvas object URLs are intentionally rendered directly. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Your finished photo strip" className="w-full border-2 border-ink shadow-sketch" />
          {cutting && [1, 2, 3].map((line) => (
            <button
              key={line}
              className={`cut-guide ${cuts.includes(line) ? "cut-guide--done" : ""}`}
              style={{ top: `${line * 20.1 + 2.5}%` }}
              onClick={() => cut(line)}
              aria-label={`Cut between photos ${line} and ${line + 1}`}
            >
              <Scissors size={24} className="cut-scissors" aria-hidden="true" />
            </button>
          ))}
        </motion.div>
        {cutting && (
          <div className="mt-6 rounded-xl border-2 border-dashed border-ink/40 bg-paper/80 p-4 text-center">
            <p className="font-hand font-bold">Tap each dotted line to snip</p>
            <div className="mt-3 flex justify-center gap-2">
              {[1, 2, 3].map((line) => <button key={line} className="mini-cut" onClick={() => cut(line)} disabled={cuts.includes(line)}>Cut {line}</button>)}
            </div>
            {cuts.length === 3 && <button className="text-link mt-4" onClick={downloadIndividuals}>Download the four cut photos</button>}
          </div>
        )}
      </div>
    </section>
  );
}
