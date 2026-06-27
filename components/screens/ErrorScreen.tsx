import { Camera, Upload } from "lucide-react";
import { SketchButton } from "@/components/ui/SketchButton";
import type { BoothErrorCode } from "@/hooks/useBoothWorkflow";

const errorCopy: Record<BoothErrorCode, { title: string; body: string }> = {
  unsupported: { title: "This browser has no camera hatch.", body: "Camera capture is not supported here, but the upload route works beautifully." },
  insecure: { title: "The camera needs a secure room.", body: "Open this booth over HTTPS or use localhost, then try again." },
  denied: { title: "The curtain stayed closed.", body: "Camera access was denied. You can change the site permission in your browser or upload four photos instead." },
  unavailable: { title: "No camera was found.", body: "Connect a camera, check that it is enabled, or continue with uploaded photos." },
  busy: { title: "The camera is already posing elsewhere.", body: "Close other apps using the camera, then try again." },
  unknown: { title: "The camera got stage fright.", body: "Something unexpected interrupted camera access. Try once more or use uploads." },
  capture: { title: "That frame slipped away.", body: "The camera could not capture the image. Restart the sequence or use uploads." },
};

interface ErrorScreenProps {
  code: BoothErrorCode;
  onRetry: () => void;
  onUpload: () => void;
  onBack: () => void;
}

export function ErrorScreen({ code, onRetry, onUpload, onBack }: ErrorScreenProps) {
  const copy = errorCopy[code];
  return (
    <section className="screen-card max-w-2xl text-center" role="alert" aria-labelledby="error-title">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border-[3px] border-ink bg-blush rotate-[2deg]"><Camera size={34} /></div>
      <p className="eyebrow">A small booth mishap</p>
      <h1 id="error-title" className="screen-title">{copy.title}</h1>
      <p className="mx-auto mt-4 max-w-lg text-lg leading-7 text-ink/75">{copy.body}</p>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <SketchButton tone="rust" onClick={onRetry}><Camera size={19} /> Try camera again</SketchButton>
        <SketchButton tone="paper" onClick={onUpload}><Upload size={19} /> Upload instead</SketchButton>
      </div>
      <button className="text-link mt-6" onClick={onBack}>Back to choices</button>
    </section>
  );
}
