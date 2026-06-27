"use client";

import { Camera, LockKeyhole, Upload } from "lucide-react";
import { cameraReadiness, mapCameraError, requestCamera, type CameraErrorCode } from "@/lib/camera";
import { SketchButton } from "@/components/ui/SketchButton";
import type { MediaStreamLike } from "./types";

interface CameraPermissionProps {
  onGranted: (stream: MediaStreamLike) => void;
  onUpload: () => void;
  onBack: () => void;
  onError: (code: CameraErrorCode) => void;
}

export function CameraPermission({ onGranted, onUpload, onBack, onError }: CameraPermissionProps) {
  const enableCamera = async () => {
    const readiness = cameraReadiness();
    if (readiness) {
      onError(readiness);
      return;
    }
    try {
      onGranted(await requestCamera());
    } catch (error) {
      onError(mapCameraError(error));
    }
  };

  return (
    <section className="screen-card max-w-2xl text-center" aria-labelledby="permission-title">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border-[3px] border-ink bg-cream rotate-[-2deg]">
        <LockKeyhole size={34} aria-hidden="true" />
      </div>
      <p className="eyebrow">Before the curtain closes</p>
      <h1 id="permission-title" className="screen-title">Your photos stay with you.</h1>
      <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-ink/75 sm:text-lg">
        Camera frames are processed only inside this browser. Nothing is uploaded, stored, or sent anywhere.
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
        <SketchButton onClick={enableCamera} tone="rust"><Camera size={20} /> Allow camera</SketchButton>
        <SketchButton onClick={onUpload} tone="paper"><Upload size={20} /> Upload instead</SketchButton>
      </div>
      <button className="text-link mt-6" onClick={onBack}>Back to choices</button>
    </section>
  );
}
