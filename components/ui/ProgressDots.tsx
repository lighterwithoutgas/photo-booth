interface ProgressDotsProps {
  current: number;
  total?: number;
}

export function ProgressDots({ current, total = 4 }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`Photo ${Math.min(current + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`progress-dot ${index < current ? "progress-dot--done" : index === current ? "progress-dot--active" : ""}`} />
      ))}
    </div>
  );
}
