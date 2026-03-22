interface Props {
  location: string;
  onLocationChange: (v: string) => void;
  onRun: () => void;
  onExport: () => void;
  isRunning: boolean;
  hasResults: boolean;
}

export default function SearchForm({ location, onLocationChange, onRun, onExport, isRunning, hasResults }: Props) {
  return (
    <div className="search-form">
      <div className="search-row">
        <div className="input-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Baldwin County, Alabama"
            disabled={isRunning}
          />
        </div>
        <button className="btn-primary" onClick={onRun} disabled={isRunning || !location.trim()}>
          {isRunning ? (
            <span className="btn-inner"><span className="spinner" />Running...</span>
          ) : (
            <span className="btn-inner">◈ Run Agent</span>
          )}
        </button>
        {hasResults && (
          <button className="btn-secondary" onClick={onExport} disabled={isRunning}>
            ↓ Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
