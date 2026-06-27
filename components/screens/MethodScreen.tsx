import { Camera, ImageUp } from "lucide-react";

interface MethodScreenProps {
  onCamera: () => void;
  onUpload: () => void;
  onBack: () => void;
}

export function MethodScreen({ onCamera, onUpload, onBack }: MethodScreenProps) {
  return (
    <section className="screen-card max-w-4xl text-center" aria-labelledby="method-title">
      <p className="eyebrow">Pick your doorway</p>
      <h1 id="method-title" className="screen-title">How are we making this strip?</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <button className="method-card" onClick={onCamera}>
          <span className="method-icon rotate-[-2deg]"><Camera size={39} /></span>
          <strong>Use my camera</strong><span>Take four fresh photos with a 3–2–1 countdown.</span>
        </button>
        <button className="method-card" onClick={onUpload}>
          <span className="method-icon rotate-[2deg]"><ImageUp size={39} /></span>
          <strong>Upload photos</strong><span>Choose, reorder, and crop four photos you already love.</span>
        </button>
      </div>
      <button className="text-link mt-7" onClick={onBack}>Back outside</button>
    </section>
  );
}
