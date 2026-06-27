"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import { FILTERS } from "@/lib/filters";
import { canvasToBlob, renderStripCanvas } from "@/lib/canvas";
import type { FrameId, PhotoItem, StripOptions } from "@/types/photo";
import { SketchButton } from "@/components/ui/SketchButton";

const frames: { id: FrameId; name: string; color: string; ink: string; previewImage?: string }[] = [
  { id: "cream", name: "Classic cream", color: "#e9dfc4", ink: "#232a2e" },
  { id: "charcoal", name: "Dark charcoal", color: "#24282a", ink: "#f4efe3" },
  { id: "red", name: "Warm red", color: "#9c4035", ink: "#fff7e8" },
  { id: "pink", name: "Pastel pink", color: "#e7b8b0", ink: "#332c2a" },
  { id: "doodle", name: "Doodle paper", color: "#f2ead8", ink: "#6f7f67" },
  { id: "white", name: "Minimal white", color: "#fffdf7", ink: "#22292e" },
  { id: "couple", name: "Your handmade paper", color: "#f3cdd0", ink: "#913447", previewImage: "/papers/couple-handmade-original.png" },
  { id: "friends", name: "Best friends", color: "#d5ddcb", ink: "#3f5b58" },
  { id: "birthday", name: "Birthday confetti", color: "#ead8a9", ink: "#594968" },
  { id: "moonlit", name: "Moonlit dreams", color: "#e8d4ef", ink: "#7041a0", previewImage: "/papers/moonlit-dreams.png" },
  { id: "botanical", name: "Botanical garden", color: "#e9e4bd", ink: "#5f6334", previewImage: "/papers/botanical-garden.png" },
  { id: "cherry", name: "Cherry doodles", color: "#fff1d7", ink: "#932a28", previewImage: "/papers/cherry-doodles.png" },
  { id: "loveletters", name: "Love letters", color: "#f9d7dc", ink: "#b83f59", previewImage: "/papers/love-letters.png" },
];

const artistPaperFrames = new Set<FrameId>(["couple", "moonlit", "botanical", "cherry", "loveletters"]);

export const DEFAULT_STRIP_OPTIONS: StripOptions = {
  filter: "original",
  frame: "cream",
  border: "ink",
  footerText: "tiny moments, kept",
  showDate: true,
};

interface StripEditorProps {
  photos: PhotoItem[];
  options: StripOptions;
  onOptionsChange: (options: StripOptions) => void;
  onConfirm: (blob: Blob) => void;
  onBack: () => void;
}

export function StripEditor({ photos, options, onOptionsChange, onConfirm, onBack }: StripEditorProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [rendering, setRendering] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let nextUrl = "";
    setRendering(true);
    renderStripCanvas(photos, options)
      .then(canvasToBlob)
      .then((blob) => {
        if (!active) return;
        nextUrl = URL.createObjectURL(blob);
        setPreviewUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return nextUrl;
        });
        setError("");
      })
      .catch(() => setError("The preview could not be rendered. Try another image."))
      .finally(() => active && setRendering(false));
    return () => {
      active = false;
    };
  }, [photos, options]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const setOption = <Key extends keyof StripOptions>(key: Key, value: StripOptions[Key]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  const cycleFrame = (direction: -1 | 1) => {
    const index = frames.findIndex((frame) => frame.id === options.frame);
    setOption("frame", frames[(index + direction + frames.length) % frames.length].id);
  };

  const confirm = async () => {
    setRendering(true);
    try {
      const canvas = await renderStripCanvas(photos, options);
      onConfirm(await canvasToBlob(canvas));
    } catch {
      setError("The final strip could not be exported. Please try again.");
    } finally {
      setRendering(false);
    }
  };

  return (
    <section className="editor-shell" aria-labelledby="editor-title">
      <div className="col-span-full flex items-start justify-between gap-4">
        <div><p className="eyebrow">The tiny print room</p><h1 id="editor-title" className="screen-title">Make it feel like yours.</h1></div>
        <button className="icon-button" onClick={onBack} aria-label="Exit strip editor"><X /></button>
      </div>

      <div className="preview-stage">
        <button className="frame-arrow left-2" onClick={() => cycleFrame(-1)} aria-label="Previous frame"><ChevronLeft /></button>
        <div className="relative mx-auto w-[min(62vw,250px)]">
          {rendering && <div className="absolute inset-0 z-10 grid place-items-center bg-paper/75 font-hand font-bold">developing…</div>}
          {/* Canvas object URLs are intentionally rendered directly. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {previewUrl && <img src={previewUrl} alt="Live photo strip preview" className="w-full rotate-[-1deg] border-2 border-ink shadow-sketch" />}
        </div>
        <button className="frame-arrow right-2" onClick={() => cycleFrame(1)} aria-label="Next frame"><ChevronRight /></button>
      </div>

      <div className="editor-controls">
        <fieldset>
          <legend className="control-label">1. Pick a print finish</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FILTERS.map((filter) => (
              <button key={filter.id} onClick={() => setOption("filter", filter.id)} className={`choice-chip ${options.filter === filter.id ? "choice-chip--selected" : ""}`} aria-pressed={options.filter === filter.id}>
                {options.filter === filter.id && <Check size={15} />} {filter.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="control-label">2. Choose the paper</legend>
          <div className="flex flex-wrap gap-3">
            {frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setOption("frame", frame.id)}
                className={`frame-swatch ${options.frame === frame.id ? "frame-swatch--selected" : ""}`}
                style={{
                  background: frame.color,
                  backgroundImage: frame.previewImage ? `url(${frame.previewImage})` : undefined,
                  backgroundPosition: "top center",
                  backgroundSize: "cover",
                  color: frame.ink,
                }}
                aria-label={frame.name}
                aria-pressed={options.frame === frame.id}
              >
                {options.frame === frame.id && <Check size={18} />}
              </button>
            ))}
          </div>
          <p className="mt-2 font-hand font-bold">{frames.find((frame) => frame.id === options.frame)?.name}</p>
        </fieldset>

        <fieldset>
          <legend className="control-label">3. Add the finishing notes</legend>
          {artistPaperFrames.has(options.frame) ? (
            <p className="rounded-xl border-2 border-dashed border-rust/45 bg-[#f3cdd0]/55 p-4 text-sm font-semibold text-ink/75">
              This artist paper keeps its original hand-drawn borders and finish exactly as designed.
            </p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-2" aria-label="Photo border style">
                {([['ink', 'Sketchy'], ['soft', 'Soft'], ['none', 'Borderless']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setOption("border", id)} className={`choice-chip ${options.border === id ? "choice-chip--selected" : ""}`} aria-pressed={options.border === id}>{label}</button>
                ))}
              </div>
              <label className="block text-sm font-semibold" htmlFor="footerText">Footer text</label>
              <input id="footerText" className="sketch-input mt-2" maxLength={36} value={options.footerText} onChange={(event) => setOption("footerText", event.target.value)} />
              <label className="check-row mt-4"><input type="checkbox" checked={options.showDate} onChange={(event) => setOption("showDate", event.target.checked)} /> Add today&apos;s date</label>
            </>
          )}
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-dashed border-ink/30 pt-5">
          <button className="text-link inline-flex items-center gap-2" onClick={() => onOptionsChange(DEFAULT_STRIP_OPTIONS)}><RotateCcw size={16} /> Reset</button>
        </div>
        {error && <p role="alert" className="font-semibold text-rust">{error}</p>}
        <SketchButton onClick={confirm} tone="rust" full disabled={rendering}>Print this strip →</SketchButton>
      </div>
    </section>
  );
}
