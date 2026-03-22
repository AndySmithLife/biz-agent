interface Props {
  status: string;
  stepIndex: number;
  totalSteps: number;
  isRunning: boolean;
  errors: string[];
}

export default function StatusBar({ status, stepIndex, totalSteps, isRunning, errors }: Props) {
  const progress = isRunning
    ? ((stepIndex / totalSteps) * 90)
    : 100;

  return (
    <div className="status-bar">
      <div className="status-top">
        {isRunning && <span className="spinner" />}
        <span className="status-text">{status}</span>
        <div className="step-dots">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={
                i < stepIndex ? "dot done" :
                i === stepIndex ? "dot active" :
                "dot"
              }
            />
          ))}
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((e, i) => <span key={i} className="error-item">⚠ {e}</span>)}
        </div>
      )}
    </div>
  );
}
