# watashi_

1.  Global config (45 min)

-   tsconfig strict + path aliases (e.g. @/lib, @/components).

-   tailwind.config.ts with shadcn preset.

-   add shadcn/ui (npx shadcn-ui@latest init) into src/components/ui.

1.  Database layer (2 h)

-   Supabase project → copy SUPABASE_URL & SERVICE_ROLE_KEY into .env.local.

-   pnpm i drizzle-orm drizzle-kit pg @vercel/postgres

-   Create db package src/lib/db

-   schema.ts exactly mirrors tables in PRD.

-   drizzle.config.ts in root; pnpm drizzle-kit generate && push.

-   Seed script (pnpm tsx scripts/seed.ts) to create demo user + dummy chart.

1.  Auth (Better Auth) (1 h)

-   pnpm i better-auth

-   src/lib/auth.ts: BetterAuth + drizzleAdapter + JWT cookies.

-   Middleware (middleware.ts) to protect all routes under /dashboard.

-   Client hook useSession() in src/lib/use-session.ts.

1.  Core API routes (Edge) (3 h)

Structure: src/app/api/.../route.ts (uses App Router).

a) /api/chart/calculate (POST)

-   Auth check → calculateBirthChart() (stub Swiss Ephemeris call for now).

-   Return chart JSON & store in DB.

b) /api/agents/generate (POST)

-   Uses generateAgentPersona() to upsert 10 planetary_agents.

c) /api/chat (POST, stream)

-   openai stream via @ai-sdk/openai + Vercel AI Edge.

-   Fetch agent systemPrompt from DB, stream to client.

1.  Core services in /src/lib (2 h)

-   astrology/calculator.ts (stub): returns fake positions if Swiss API fails.

-   astrology/persona-generator.ts (real archetype map + placeholder algo).

-   chat/client.ts: thin fetch wrapper with fetch("/api/chat").

1.  Next.js Pages & Layout (2 h)

Directory map (App Router):

src/app

/(auth)

login/page.tsx

signup/page.tsx

/(dashboard)

layout.tsx   // protected layout w/ sidebar

page.tsx    // dashboard home

chart/page.tsx

agents/page.tsx

conversations/[id]/page.tsx

settings/page.tsx

-   Implement minimal UI (Tailwind + shadcn placeholders).

-   Global Zustand store (src/lib/store.ts) with interfaces from PRD.

1.  CI/CD (30 min)

-   GitHub Actions workflow: install->lint->type-check->test.

-   Connect Vercel project; set ENV vars on Vercel.

Deliverables EOD 1

✔️ Repo builds & deploys on Vercel.

✔️ Supabase + Drizzle migrations executed.

✔️ Better Auth signup/login works.

✔️ POST /api/chart/calculate returns stub data.

✔️ Dashboard shell visible after login.

═══════════════════════════════

DAY 2  Front-End Features & Polish (≈10 h)

"Delight Day"

═══════════════════════════════

1.  Birth-Chart Input Wizard (2 h)

-   RHF + Zod on /signup step 2 or a standalone /onboarding route group.

-   Components: DatePicker, TimePicker, MapboxAutocomplete (install @mapbox/search-js).

-   On submit → call /api/chart/calculate → push to /dashboard.

1.  Planetary Agent Grid (1 h)

-   AgentCard shadcn card showing planet emoji, sign, house.

-   Grid in /dashboard/agents page from Zustand agents store.

1.  Chat Interface (3 h)

-   Create ChatWindow component:

-   MessageBubble (role-based styles).

-   useChatStream hook (wraps fetch + ReadableStream).

-   Persist messages via /api/messages (edge route or inside /api/chat).

-   Conversation list page with optimistic add/rename.

1.  Birth-Chart Visualization (2 h)

-   Lightweight SVG wheel or Recharts polar chart.

-   Clicking a planet triggers router.push(/dashboard/agents?planet=sun).

1.  UX Polish (1 h)

-   Dark mode with next-themes.

-   Loading skeletons, error boundaries, toast notifications.

-   Mobile responsive tweaks (flex-col sidebar, bottom nav).

1.  QA + Docs + Buffer (1 h)

-   Lighthouse, cross-browser smoke.

-   Update README (setup, scripts, env).

-   Tag v0.1, deploy to production.

═══════════════════════════════

Folder-by-Folder Cheat-Sheet

═══════════════════════════════

src/

app/...   → Next .js 14 routes & layouts

lib/

auth.ts → BetterAuth helpers

db/   → Drizzle schema & client

astrology/

calculator.ts

persona-generator.ts

store.ts → Zustand global store

components/

ui/   → shadcn base

chart/ → Birth chart SVG

chat/  → ChatWindow, MessageBubble

scripts/

seed.ts → demo data

.env.local (sample)
