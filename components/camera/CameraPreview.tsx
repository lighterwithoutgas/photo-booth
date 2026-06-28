"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCcw, SwitchCamera, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NEXT_POSE_DELAY_MS, requestCamera, stopStream } from "@/lib/camera";
import type { PhotoItem } from "@/types/photo";
import { SketchButton } from "@/components/ui/SketchButton";
import { ProgressDots } from "@/components/ui/ProgressDots";

interface CameraPreviewProps {
  initialStream: MediaStream;
  onComplete: (photos: PhotoItem[]) => void;
  onExit: () => void;
  onError: () => void;
  shotCount?: number;
}

const wait = (duration: number) => new Promise((resolve) => window.setTimeout(resolve, duration));

export function CameraPreview({ initialStream, onComplete, onExit, onError, shotCount = 4 }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>(initialStream);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [captured, setCaptured] = useState<PhotoItem[]>([]);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState(false);
  const [betweenShots, setBetweenShots] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceIndex, setDeviceIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.srcObject = streamRef.current;
      void video.play().catch(() => undefined);
    }
    navigator.mediaDevices.enumerateDevices().then((all) => setDevices(all.filter((item) => item.kind === "videoinput"))).catch(() => undefined);
    // Do not stop the MediaStream here. React Strict Mode intentionally runs
    // effect cleanup once during its development mount probe; stopping tracks
    // in that probe permanently kills the stream used by the real mount.
    // Tracks are stopped by every actual exit path below and by the parent.
    return () => {
      if (video) video.srcObject = null;
    };
  }, []);

  const captureFrame = async (): Promise<PhotoItem> => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) throw new Error("Camera is not ready.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Camera capture is unavailable.");
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Capture failed")), "image/jpeg", 0.92));
    return { id: crypto.randomUUID(), blob, url: URL.createObjectURL(blob), name: `camera-photo-${Date.now()}.jpg` };
  };

  const beginSequence = async () => {
    if (running) return;
    setRunning(true);
    const nextPhotos: PhotoItem[] = [];
    try {
      for (let index = 0; index < shotCount; index += 1) {
        for (const number of [3, 2, 1]) {
          setCountdown(number);
          await wait(reduceMotion ? 250 : 780);
        }
        setFlash(true);
        const photo = await captureFrame();
        nextPhotos.push(photo);
        setCaptured([...nextPhotos]);
        setCountdown(null);
        await wait(reduceMotion ? 100 : 260);
        setFlash(false);
        if (index < shotCount - 1) {
          setBetweenShots(true);
          await wait(NEXT_POSE_DELAY_MS);
          setBetweenShots(false);
        }
      }
      stopStream(streamRef.current);
      onComplete(nextPhotos);
    } catch {
      stopStream(streamRef.current);
      setRunning(false);
      setCountdown(null);
      setBetweenShots(false);
      onError();
    }
  };

  const switchCamera = async () => {
    if (running || devices.length < 2) return;
    const nextIndex = (deviceIndex + 1) % devices.length;
    try {
      const nextStream = await requestCamera(devices[nextIndex].deviceId);
      stopStream(streamRef.current);
      streamRef.current = nextStream;
      if (videoRef.current) videoRef.current.srcObject = nextStream;
      setDeviceIndex(nextIndex);
    } catch {
      onError();
    }
  };

  const exit = () => {
    stopStream(streamRef.current);
    captured.forEach((photo) => URL.revokeObjectURL(photo.url));
    onExit();
  };

  return (
    <section className="camera-shell" aria-labelledby="camera-title">
      <div className="flex w-full items-center justify-between gap-3">
        <button className="icon-button" onClick={exit} aria-label="Exit camera"><X /></button>
        <div className="text-center">
          <p className="eyebrow">Look toward the little light</p>
          <h1 id="camera-title" className="font-hand text-2xl font-bold">{shotCount === 1 ? "Retake this photo" : `Photo ${Math.min(captured.length + 1, shotCount)} of ${shotCount}`}</h1>
        </div>
        <button className="icon-button" onClick={switchCamera} disabled={devices.length < 2 || running} aria-label="Switch camera"><SwitchCamera /></button>
      </div>

      <div className="camera-window">
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover scale-x-[-1]" />
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              key={countdown}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.06 }}
              className="countdown"
              aria-live="assertive"
            >{countdown}</motion.div>
          )}
          {betweenShots && (
            <motion.div
              initial={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(8px)" }}
              animate={{ opacity: 1, transform: "translateY(0)" }}
              exit={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(-5px)" }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="pose-cue"
              role="status"
            ><span>Next pose!</span></motion.div>
          )}
        </AnimatePresence>
        <div className={`camera-flash ${flash ? "camera-flash--on" : ""}`} aria-hidden="true" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/75 px-4 py-2 text-sm text-white backdrop-blur-sm">
          {betweenShots ? "One second to switch your pose" : running ? "Hold that pose…" : "The saved photo will not be mirrored"}
        </div>
      </div>

      {shotCount > 1 && <ProgressDots current={captured.length} total={shotCount} />}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SketchButton onClick={beginSequence} disabled={running} tone="rust">
          <Camera size={21} /> {running ? "Sequence in progress" : shotCount === 1 ? "Retake photo" : "Take four photos"}
        </SketchButton>
        {!running && <button className="text-link inline-flex items-center gap-2" onClick={exit}><RefreshCcw size={16} /> Restart</button>}
      </div>
      <div className="grid grid-cols-4 gap-2" aria-label="Captured photo previews" hidden={shotCount === 1}>
        {Array.from({ length: shotCount === 1 ? 0 : 4 }, (_, index) => captured[index] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <motion.img key={captured[index].id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} src={captured[index].url} alt={`Captured photo ${index + 1}`} className="aspect-[4/3] w-full border-2 border-ink object-cover scale-x-[-1]" />
        ) : <div key={index} className="aspect-[4/3] border-2 border-dashed border-ink/30 bg-white/30" />)}
      </div>
    </section>
  );
}
