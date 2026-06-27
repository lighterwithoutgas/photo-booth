"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { CameraPermission } from "@/components/camera/CameraPermission";
import { CameraPreview } from "@/components/camera/CameraPreview";
import { StripEditor } from "@/components/editor/StripEditor";
import { PrintingAnimation } from "@/components/printing/PrintingAnimation";
import { ResultScreen } from "@/components/result/ResultScreen";
import { ErrorScreen } from "@/components/screens/ErrorScreen";
import { LandingScreen } from "@/components/screens/LandingScreen";
import { MethodScreen } from "@/components/screens/MethodScreen";
import { PhotoUploader } from "@/components/upload/PhotoUploader";
import { brand } from "@/config/brand";
import { useBoothWorkflow } from "@/hooks/useBoothWorkflow";

export function PhotoBoothApp() {
  const booth = useBoothWorkflow();
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, duration: 0.44, bounce: 0.08 };

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-paper text-ink">
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header">
        <button className="brand-lockup" onClick={booth.startOver} aria-label={`${brand.name} home`}>
          <span className="brand-star">✦</span>
          <span><strong>{brand.shortName}</strong><small>photo booth</small></span>
        </button>
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-ink/60"><LockKeyhole size={14} /> Photos stay local</span>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={booth.screen}
          initial={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(10px) scale(.99)" }}
          animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
          exit={{ opacity: 0, transform: reduceMotion ? "none" : "translateY(-6px) scale(.995)" }}
          transition={transition}
          className="app-stage"
        >
          {booth.screen === "landing" && <LandingScreen onEnter={() => booth.navigate("method")} />}
          {booth.screen === "method" && <MethodScreen onCamera={() => booth.navigate("camera-permission")} onUpload={() => booth.navigate("upload")} onBack={() => booth.navigate("landing")} />}
          {booth.screen === "camera-permission" && <CameraPermission onGranted={booth.grantCamera} onUpload={() => booth.navigate("upload")} onBack={() => booth.navigate("method")} onError={booth.showError} />}
          {booth.screen === "camera" && booth.stream && <CameraPreview initialStream={booth.stream} onComplete={booth.choosePhotos} onExit={booth.leaveCamera} onError={() => booth.showError("capture")} />}
          {booth.screen === "upload" && <PhotoUploader initialPhotos={booth.photos} onContinue={booth.choosePhotos} onBack={() => booth.navigate("method")} />}
          {booth.screen === "customize" && <StripEditor photos={booth.photos} options={booth.stripOptions} onOptionsChange={booth.setStripOptions} onBack={() => booth.navigate("method")} onConfirm={booth.confirmStrip} />}
          {booth.screen === "printing" && booth.stripBlob && <PrintingAnimation blob={booth.stripBlob} onComplete={() => booth.navigate("result")} />}
          {booth.screen === "result" && booth.stripBlob && <ResultScreen blob={booth.stripBlob} photos={booth.photos} options={booth.stripOptions} onCustomize={() => booth.navigate("customize")} onStartOver={booth.startOver} />}
          {booth.screen === "error" && <ErrorScreen code={booth.errorCode} onRetry={() => booth.navigate("camera-permission")} onUpload={() => booth.navigate("upload")} onBack={() => booth.navigate("method")} />}
        </motion.div>
      </AnimatePresence>

      <footer className="site-footer"><span>{brand.footer}</span><span>Private by design · no account needed</span></footer>
    </main>
  );
}
