import { useState, useCallback, useRef } from "react";

export interface Listing {
  business_name: string;
  industry: string;
  city: string;
  asking_price: number | null;
  annual_revenue: number | null;
  cash_flow: number | null;
  source: string;
  notes: string;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-listings`;
const TOTAL_QUERIES = 5;

export function useListingAgent() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const seen = useRef(new Set<string>());

  const reset = useCallback(() => {
    setListings([]);
    setStatus("");
    setStepIndex(-1);
    setIsRunning(false);
    setIsDone(false);
    setErrors([]);
    seen.current = new Set();
  }, []);

  const run = useCallback(async (location: string) => {
    setIsRunning(true);
    setIsDone(false);
    seen.current = new Set();

    for (let i = 0; i < TOTAL_QUERIES; i++) {
      setStepIndex(i);
      setStatus(`Step ${i + 1} of ${TOTAL_QUERIES}: searching...`);

      try {
        const res = await fetch(EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ location, queryIndex: i }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const newListings = (data.listings || []).filter((l: Listing) => {
          const key = `${(l.business_name || "").toLowerCase().trim()}_${(l.city || "").toLowerCase().trim()}`;
          if (seen.current.has(key) && key !== "_") return false;
          seen.current.add(key);
          return true;
        });

        setListings((prev) => [...prev, ...newListings]);
        setStatus(`Step ${i + 1} of ${TOTAL_QUERIES}: found ${newListings.length} listings`);
      } catch (err: any) {
        setErrors((prev) => [...prev, `Step ${i + 1}: ${err.message}`]);
        setStatus(`Step ${i + 1} of ${TOTAL_QUERIES}: error — continuing`);
      }

      if (i < TOTAL_QUERIES - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setIsRunning(false);
    setIsDone(true);
    setStatus("Done");
  }, []);

  return {
    run,
    reset,
    listings,
    status,
    stepIndex,
    totalSteps: TOTAL_QUERIES,
    isRunning,
    isDone,
    errors,
  };
}
