import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a business listing research agent. Search for businesses currently for sale in the location provided.

For each listing found, extract:
- business_name: name or descriptive type if unnamed
- industry: one of: Restaurant, Healthcare, Manufacturing, Service, Retail, Distribution, Construction, Transportation, or Other
- city: specific city name
- asking_price: number only, no $ or commas, null if unknown
- annual_revenue: number only, null if unknown
- cash_flow: SDE or EBITDA as number only, null if unknown
- source: marketplace name (BizBuySell, BizQuest, LoopNet, DealStream, Sunbelt, etc.)
- notes: 1-2 sentence summary of the opportunity

Respond ONLY with a raw JSON array. No markdown fences, no explanation, no preamble.
Example: [{"business_name":"Coastal Cafe","industry":"Restaurant","city":"Fairhope","asking_price":350000,"annual_revenue":1100000,"cash_flow":210000,"source":"BizBuySell","notes":"Established cafe with strong repeat customer base."}]

Never fabricate prices or revenues. Use null if unknown.`;

function buildQueries(location: string): string[] {
  return [
    "site:bizbuysell.com businesses for sale " + location + " 2026",
    "site:bizquest.com businesses for sale " + location + " 2026",
    "site:loopnet.com businesses for sale " + location + " 2026",
    "site:sunbeltnetwork.com businesses for sale " + location,
    "site:dealstream.com businesses for sale " + location,
    "businesses for sale Fairhope Alabama asking price broker 2026",
    "businesses for sale Daphne Alabama asking price broker 2026",
    "businesses for sale Gulf Shores Alabama asking price broker 2026",
    "businesses for sale Orange Beach Foley Alabama business broker 2026",
    "businesses for sale Robertsdale Spanish Fort Alabama listing 2026",
    "restauran
