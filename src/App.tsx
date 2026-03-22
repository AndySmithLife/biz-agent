import { useState, useCallback } from "react";
import SearchForm from "./components/SearchForm";
import StatusBar from "./components/StatusBar";
import StatsRow from "./components/StatsRow";
import ListingsTable from "./components/ListingsTable";
import { useListingAgent } from "./hooks/useListingAgent";

export default function App() {
  const [location, setLocation] = useState("Baldwin County, Alabama");
  const { run, reset, listings, status, stepIndex, totalSteps, isRunning, isDone, errors } =
    useListingAgent();

  const handleRun = useCallback(() => {
    reset();
    run(location);
  }, [location, run, reset]);

  const exportCSV = useCallback(() => {
    const headers = ["Business", "Industry", "City", "Asking Price", "Annual Revenue", "Cash Flow/SDE", "Source", "Notes"];
    const rows = listings.map((l) =>
      [l.business_name, l.industry, l.city, l.asking_price, l.annual_revenue, l.cash_flow, l.source, l.notes]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `businesses-for-sale-${location.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.csv`;
    a.click();
  }, [listings, location]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-title">
            <span className="header-icon">◈</span>
            <div>
              <h1>Business Listings Agent</h1>
              <p>AI-powered deal sourcing across BizBuySell, BizQuest, LoopNet & more</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <SearchForm
          location={location}
          onLocationChange={setLocation}
          onRun={handleRun}
          onExport={exportCSV}
          isRunning={isRunning}
          hasResults={listings.length > 0}
        />

        {(isRunning || isDone) && (
          <StatusBar
            status={status}
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            isRunning={isRunning}
            errors={errors}
          />
        )}

        {listings.length > 0 && (
          <>
            <StatsRow listings={listings} />
            <ListingsTable listings={listings} />
          </>
        )}

        {isDone && listings.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">◎</span>
            <p>No listings found for this location. Try a broader area or different search terms.</p>
          </div>
        )}
      </main>
    </div>
  );
}
