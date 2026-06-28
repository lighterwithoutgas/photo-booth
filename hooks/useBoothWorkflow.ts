"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_STRIP_OPTIONS } from "@/components/editor/StripEditor";
import { stopStream, type CameraErrorCode } from "@/lib/camera";
import type { PhotoItem, StripOptions, WorkflowState } from "@/types/photo";

export type BoothErrorCode = CameraErrorCode | "capture";

export function useBoothWorkflow() {
  const [screen, setScreen] = useState<WorkflowState>("landing");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [stripOptions, setStripOptions] = useState<StripOptions>(DEFAULT_STRIP_OPTIONS);
  const [stripBlob, setStripBlob] = useState<Blob | null>(null);
  const [errorCode, setErrorCode] = useState<BoothErrorCode>("unknown");
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const photosRef = useRef(photos);
  const streamRef = useRef(stream);
  const retakeIndexRef = useRef(retakeIndex);

  photosRef.current = photos;
  streamRef.current = stream;
  retakeIndexRef.current = retakeIndex;

  useEffect(() => () => {
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    stopStream(streamRef.current);
  }, []);

  const navigate = useCallback((next: WorkflowState) => setScreen(next), []);

  const grantCamera = useCallback((nextStream: MediaStream) => {
    if (streamRef.current && streamRef.current !== nextStream) stopStream(streamRef.current);
    setStream(nextStream);
    setScreen("camera");
  }, []);

  const leaveCamera = useCallback(() => {
    stopStream(streamRef.current);
    setStream(null);
    if (retakeIndexRef.current !== null) {
      setRetakeIndex(null);
      setScreen("customize");
    } else {
      setScreen("method");
    }
  }, []);

  const startRetake = useCallback((index: number) => {
    setRetakeIndex(index);
    setScreen("camera-permission");
  }, []);

  const replacePhoto = useCallback((photo: PhotoItem) => {
    const index = retakeIndexRef.current;
    if (index === null) {
      URL.revokeObjectURL(photo.url);
      return;
    }
    setPhotos((prev) => {
      const next = [...prev];
      const old = next[index];
      if (old) URL.revokeObjectURL(old.url);
      next[index] = photo;
      return next;
    });
    setStripOptions((prev) => {
      const positions = Array.from({ length: 4 }, (_, slot) => prev.photoPositions[slot] ?? { x: 0, y: 0 });
      positions[index] = { x: 0, y: 0 };
      return { ...prev, photoPositions: positions };
    });
    stopStream(streamRef.current);
    setStream(null);
    setRetakeIndex(null);
    setScreen("customize");
  }, []);

  const choosePhotos = useCallback((nextPhotos: PhotoItem[]) => {
    const retainedIds = new Set(nextPhotos.map((photo) => photo.id));
    photosRef.current.forEach((photo) => {
      if (!retainedIds.has(photo.id)) URL.revokeObjectURL(photo.url);
    });
    setPhotos(nextPhotos);
    setStream(null);
    setScreen("customize");
  }, []);

  const showError = useCallback((code: BoothErrorCode) => {
    stopStream(streamRef.current);
    setStream(null);
    setErrorCode(code);
    setScreen("error");
  }, []);

  const confirmStrip = useCallback((blob: Blob) => {
    setStripBlob(blob);
    setScreen("printing");
  }, []);

  const startOver = useCallback(() => {
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    stopStream(streamRef.current);
    setPhotos([]);
    setStream(null);
    setStripBlob(null);
    setStripOptions(DEFAULT_STRIP_OPTIONS);
    setErrorCode("unknown");
    setRetakeIndex(null);
    setScreen("landing");
  }, []);

  return {
    screen,
    photos,
    stream,
    stripOptions,
    stripBlob,
    errorCode,
    retakeIndex,
    navigate,
    grantCamera,
    leaveCamera,
    choosePhotos,
    startRetake,
    replacePhoto,
    showError,
    confirmStrip,
    setStripOptions,
    startOver,
  };
}
