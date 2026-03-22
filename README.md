# Business Listings Agent

AI-powered deal sourcing tool. Searches BizBuySell, BizQuest, LoopNet, Sunbelt, and more for businesses for sale in any location you specify.

## How it works

1. You enter a location (e.g. "Baldwin County, Alabama" or "Mobile, Alabama")
2. The agent runs 5 targeted searches via the Anthropic API with web search enabled
3. Results are deduplicated, structured, and displayed in a filterable table
4. Export to CSV when done

---

## Deploying to Lovable

### Step 1 — Create a new Lovable project

Go to lovable.dev, create a new project, and choose "Import from code" or start blank and paste files in.

### Step 2 — Add the files

Copy the following into your Lovable project, maintaining the folder structure:

```
src/
  App.tsx
  main.tsx
  index.css
  hooks/
    useListingAgent.ts
  components/
    SearchForm.tsx
    StatusBar.tsx
    StatsRow.tsx
    ListingsTable.tsx
supabase/
  functions/
    search-listings/
      index.ts
```

### Step 3 — Set up Supabase Edge Function

In your Lovable project, go to Supabase settings and deploy the edge function:

```bash
supabase functions deploy search-listings
```

Then set the secret in Supabase:

```bash
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

You can get your Anthropic API key at: https://console.anthropic.com

### Step 4 — Set environment variables in Lovable

In your Lovable project settings, add:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

Both values are in your Supabase project under Settings > API.

### Step 5 — Deploy

Hit deploy in Lovable. Done.

---

## Architecture

```
Browser (React)
    |
    | POST { location, queryIndex }
    v
Supabase Edge Function (Deno)
    |
    | POST with ANTHROPIC_API_KEY (server-side, never exposed)
    v
Anthropic API (claude-sonnet-4 + web_search tool)
    |
    v
Returns structured JSON listings
    |
    v
React deduplicates and renders table
```

The API key never touches the browser. The edge function runs server-side in Supabase's Deno environment.

---

## Extending the agent

**Add more search queries:** Edit the `buildQueries` function in `supabase/functions/search-listings/index.ts`.

**Filter by industry on startup:** Add a default `filterIndustry` state in `ListingsTable.tsx`.

**Add email alerts for new listings:** Set up a Supabase cron job that calls the edge function on a schedule and emails results via Resend or SendGrid.

**Save results to database:** Add a Supabase table and insert listings from the edge function before returning them.
