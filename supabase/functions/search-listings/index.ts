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
    `businesses for sale ${location} BizBuySell listing price revenue 2026`,
    `businesses for sale ${location} asking price cash flow SDE 2026`,
    `manufacturing fabrication mechanical electrical business for sale ${location}`,
    `service business restaurant retail for sale ${location} EBITDA broker`,
    `businesses for sale ${location} BizQuest LoopNet Sunbelt 2026`,
  ];
}

async function callClaude(query: string, apiKey: string): Promise<any[]> {
  const payload = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `Search and extract all business listings for: ${query}\n\nReturn only a JSON array.`,
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  let text = "";

  if (data.stop_reason === "tool_use") {
    const toolBlock = data.content.find((b: any) => b.type === "tool_use");
    const followup = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          ...payload.messages,
          { role: "assistant", content: data.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolBlock.id,
                content: "Search complete",
              },
            ],
          },
        ],
      }),
    });
    const data2 = await followup.json();
    text = data2.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
  } else {
    text = data.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");
  }

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    return JSON.parse(match[0]);
  } catch {
    // Salvage partial JSON
    const truncated = match[0].replace(/,\s*\{[^}]*$/, "]");
    try {
      return JSON.parse(truncated);
    } catch {
      return [];
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { location, queryIndex } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const queries = buildQueries(location);
    if (queryIndex < 0 || queryIndex >= queries.length) {
      return new Response(JSON.stringify({ error: "Invalid queryIndex", total: queries.length }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const listings = await callClaude(queries[queryIndex], apiKey);

    return new Response(
      JSON.stringify({
        listings,
        queryIndex,
        total: queries.length,
        query: queries[queryIndex],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
