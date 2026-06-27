"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Replace, Trash2, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { validateImageFile } from "@/lib/validation";
import type { PhotoItem } from "@/types/photo";
import { SketchButton } from "@/components/ui/SketchButton";

interface PhotoUploaderProps {
  initialPhotos?: PhotoItem[];
  onContinue: (photos: PhotoItem[]) => void;
  onBack: () => void;
}

async function toPhoto(file: File): Promise<PhotoItem> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return { id: crypto.randomUUID(), blob: file, url, name: file.name };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("That image could not be decoded.");
  }
}

export function PhotoUploader({ initialPhotos = [], onContinue, onBack }: PhotoUploaderProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [message, setMessage] = useState("");
  const multipleInput = useRef<HTMLInputElement>(null);

  const addFiles = async (files: FileList | File[], replaceIndex?: number) => {
    const selected = Array.from(files);
    if (replaceIndex === undefined) {
      const available = 4 - photos.length;
      if (available === 0) {
        setMessage("All four spots are already filled. Replace or remove a photo to make a change.");
        return;
      }
      if (selected.length > available) {
        setMessage(`Choose no more than ${available} ${available === 1 ? "photo" : "photos"}.`);
        return;
      }
    }
    for (const file of selected) {
      const error = validateImageFile(file);
      if (error) {
        setMessage(`${file.name}: ${error}`);
        return;
      }
    }
    try {
      const loaded = await Promise.all(selected.map(toPhoto));
      if (replaceIndex !== undefined && loaded[0]) {
        setPhotos((current) => {
          const next = [...current];
          URL.revokeObjectURL(next[replaceIndex].url);
          next[replaceIndex] = loaded[0];
          loaded.slice(1).forEach((photo) => URL.revokeObjectURL(photo.url));
          return next;
        });
      } else {
        setPhotos((current) => [...current, ...loaded]);
      }
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "One of those images could not be opened.");
    }
  };

  const handleBulkSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) await addFiles(event.currentTarget.files);
    event.currentTarget.value = "";
  };

  const handleReplacement = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.currentTarget.files) await addFiles(event.currentTarget.files, index);
    event.currentTarget.value = "";
  };

  const remove = (index: number) => {
    setPhotos((current) => {
      URL.revokeObjectURL(current[index].url);
      return current.filter((_, photoIndex) => photoIndex !== index);
    });
  };

  const move = (index: number, direction: -1 | 1) => {
    setPhotos((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <section className="screen-card w-full max-w-5xl" aria-labelledby="upload-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Bring your own moments</p>
          <h1 id="upload-title" className="screen-title">Choose exactly four photos.</h1>
          <p className="mt-2 text-ink/70">JPEG, PNG, or WebP · up to 12 MB each · never uploaded</p>
        </div>
        <button className="icon-button shrink-0" onClick={onBack} aria-label="Close uploader"><X /></button>
      </div>

      <button className="upload-drop mt-7" onClick={() => multipleInput.current?.click()} disabled={photos.length === 4}>
        <Upload size={28} aria-hidden="true" />
        <span className="font-hand text-xl font-bold">{photos.length === 4 ? "All four spots are filled" : `Pick up to ${4 - photos.length} ${4 - photos.length === 1 ? "photo" : "photos"}`}</span>
        <span className="text-sm text-ink/60">{photos.length === 4 ? "Replace or remove a photo below to make a change." : "You can replace, remove, and reorder below."}</span>
      </button>
      <input ref={multipleInput} hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleBulkSelection} />

      <p className="mt-4 min-h-6 text-sm font-semibold text-rust" role="alert">{message}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => {
          const photo = photos[index];
          return (
            <motion.article key={photo?.id ?? `empty-${index}`} layout className="photo-slot">
              <span className="photo-number">{index + 1}</span>
              {photo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={`Photo ${index + 1}: ${photo.name}`} className="aspect-[4/3] w-full object-cover" />
                  <div className="grid grid-cols-4 border-t-2 border-ink bg-paper">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="slot-action" aria-label={`Move photo ${index + 1} earlier`}><ArrowUp size={17} /></button>
                    <button onClick={() => move(index, 1)} disabled={index === photos.length - 1} className="slot-action" aria-label={`Move photo ${index + 1} later`}><ArrowDown size={17} /></button>
                    <label className="slot-action cursor-pointer" aria-label={`Replace photo ${index + 1}`}><Replace size={17} /><input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleReplacement(event, index)} /></label>
                    <button onClick={() => remove(index)} className="slot-action text-rust" aria-label={`Remove photo ${index + 1}`}><Trash2 size={17} /></button>
                  </div>
                </>
              ) : (
                <button className="grid aspect-[4/3] w-full place-items-center bg-white/40 text-ink/50" onClick={() => multipleInput.current?.click()} aria-label={`Add photo ${index + 1}`}><ImagePlus size={30} /></button>
              )}
            </motion.article>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p aria-live="polite" className="font-hand font-bold">{photos.length} / 4 spots filled</p>
        <SketchButton tone="rust" disabled={photos.length !== 4} onClick={() => onContinue(photos)}>Style my strip →</SketchButton>
      </div>
    </section>
  );
}
