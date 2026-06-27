import { LockKeyhole, Sparkles } from "lucide-react";
import { BoothIllustration } from "@/components/booth/BoothIllustration";
import { SketchButton } from "@/components/ui/SketchButton";
import { brand } from "@/config/brand";

interface LandingScreenProps {
  onEnter: () => void;
}

export function LandingScreen({ onEnter }: LandingScreenProps) {
  return (
    <section className="landing" aria-labelledby="landing-title">
      <div className="landing-copy">
        <p className="eyebrow"><Sparkles size={16} /> Pull the curtain. Keep the moment.</p>
        <h1 id="landing-title">A little photo booth, right in your browser.</h1>
        <p>{brand.tagline}</p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <SketchButton tone="rust" onClick={onEnter}>Step inside <span aria-hidden="true">→</span></SketchButton>
          <span className="privacy-note"><LockKeyhole size={16} /> Nothing gets uploaded</span>
        </div>
      </div>
      <div className="landing-art"><BoothIllustration /></div>
      <p className="landing-doodle" aria-hidden="true">four snaps<br />one tiny story ↗</p>
    </section>
  );
}
