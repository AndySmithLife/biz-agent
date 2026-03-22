import { Listing } from "../hooks/useListingAgent";

function median(arr: number[]) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function fmtK(n: number | null) {
  if (n === null) return "—";
  return n >= 1000000
    ? `$${(n / 1000000).toFixed(1)}M`
    : `$${Math.round(n / 1000)}K`;
}

interface Props { listings: Listing[]; }

export default function StatsRow({ listings }: Props) {
  const priced = listings.filter((l) => l.asking_price).map((l) => Number(l.asking_price));
  const med = median(priced);
  const avg = priced.length ? priced.reduce((a, b) => a + b, 0) / priced.length : null;
  const industries = [...new Set(listings.map((l) => l.industry).filter(Boolean))];

  return (
    <div className="stats-row">
      <div className="stat-card">
        <span className="stat-label">Total Listings</span>
        <span className="stat-value">{listings.length}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">With Price</span>
        <span className="stat-value">{priced.length}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Median Ask</span>
        <span className="stat-value">{fmtK(med)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Avg Ask</span>
        <span className="stat-value">{fmtK(avg)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Industries</span>
        <span className="stat-value">{industries.length}</span>
      </div>
    </div>
  );
}
