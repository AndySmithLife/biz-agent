import { useState, useMemo } from "react";
import { Listing } from "../hooks/useListingAgent";

const INDUSTRY_COLORS: Record<string, string> = {
  Restaurant: "badge-orange",
  Healthcare: "badge-green",
  Manufacturing: "badge-red",
  Service: "badge-blue",
  Retail: "badge-purple",
  Distribution: "badge-teal",
  Construction: "badge-amber",
  Transportation: "badge-slate",
  Other: "badge-gray",
};

function fmt(n: number | null) {
  if (n === null || n === undefined) return null;
  return "$" + Number(n).toLocaleString();
}

interface Props { listings: Listing[]; }

export default function ListingsTable({ listings }: Props) {
  const [filterText, setFilterText] = useState("");
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const industries = useMemo(() => [...new Set(listings.map((l) => l.industry).filter(Boolean))].sort(), [listings]);
  const cities = useMemo(() => [...new Set(listings.map((l) => l.city).filter(Boolean))].sort(), [listings]);

  const filtered = useMemo(() => {
    const t = filterText.toLowerCase();
    return listings.filter((l) => {
      if (filterIndustry && l.industry !== filterIndustry) return false;
      if (filterCity && l.city !== filterCity) return false;
      if (t) {
        const hay = [l.business_name, l.city, l.industry, l.notes, l.source].join(" ").toLowerCase();
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [listings, filterText, filterIndustry, filterCity]);

  return (
    <div className="table-section">
      <div className="filter-row">
        <input
          type="text"
          placeholder="Filter by name, city, notes..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="filter-input"
        />
        <select value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} className="filter-select">
          <option value="">All Industries</option>
          {industries.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="filter-select">
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="filter-count">{filtered.length} of {listings.length}</span>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Business / Type</th>
              <th>Industry</th>
              <th>City</th>
              <th>Asking Price</th>
              <th>Revenue</th>
              <th>Cash Flow</th>
              <th>Source</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="no-results">No results match your filters.</td></tr>
            ) : (
              filtered.map((l, i) => (
                <tr key={i}>
                  <td className="td-name">{l.business_name || "Unlisted"}</td>
                  <td>
                    <span className={`badge ${INDUSTRY_COLORS[l.industry] || "badge-gray"}`}>
                      {l.industry || "—"}
                    </span>
                  </td>
                  <td>{l.city || "—"}</td>
                  <td className={l.asking_price ? "td-price" : "td-na"}>{fmt(l.asking_price) || "—"}</td>
                  <td className={l.annual_revenue ? "td-revenue" : "td-na"}>{fmt(l.annual_revenue) || "—"}</td>
                  <td className={l.cash_flow ? "td-cf" : "td-na"}>{fmt(l.cash_flow) || "—"}</td>
                  <td><span className="source-tag">{l.source || "—"}</span></td>
                  <td className="td-notes">{l.notes || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
