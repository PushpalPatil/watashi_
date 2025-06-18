# Astro Agents - Product Requirements Document

## 1. Product Overview

### 1.1 Product Name
**Watashi** - Personalized AI Companions Based on Your Birth Chart

### 1.2 Product Vision
Create an innovative AI-powered platform where users can interact with personified versions of planets from their birth chart, each with unique personalities derived from astrological interpretations.

### 1.3 Target Audience
- Primary: Astrology enthusiasts aged 18-45 who are tech-savvy
- Secondary: Personal development seekers interested in self-reflection
- Tertiary: Curious users exploring AI and personality-based interactions

### 1.4 Key Value Propositions
- Personalized AI companions based on authentic astrological calculations
- Unique conversation experiences with different planetary archetypes
- Deep self-reflection through astrological lens
- Cutting-edge AI technology meets ancient wisdom

## 2. Technical Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework:** Next.js 14 (App Router)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Real-time:** Vercel AI SDK (streaming responses)
- **Charts:** Recharts for birth chart visualization
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod validation

#### Backend & Infrastructure
- **Database:** Supabase (PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Better Auth
- **File Storage:** Supabase Storage
- **Edge Functions:** Vercel Edge Functions
- **Caching:** Vercel KV (Redis)
- **Analytics:** Vercel Analytics
- **Monitoring:** Vercel Monitoring + Sentry

#### AI & External Services
- **LLM:** Vercel AI SDK with OpenAI GPT-4
- **Astrology Calculations:** Astrology API
- **Geocoding:** Google Maps API
- **Timezone:** Temporal API or moment-timezone


### 2.2 Database Schema

```sql
-- Users table (handled by Better Auth)
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Birth charts table
birth_charts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_location VARCHAR NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timezone VARCHAR NOT NULL,
  chart_data JSONB NOT NULL, -- Raw astronomical data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Planetary agents table
planetary_agents (
  id UUID PRIMARY KEY,
  birth_chart_id UUID REFERENCES birth_charts(id),
  planet VARCHAR NOT NULL, -- sun, moon, mercury, etc.
  sign VARCHAR NOT NULL,
  house INTEGER NOT NULL,
  degree DECIMAL(5, 2) NOT NULL,
  aspects JSONB, -- Aspects to other planets
  persona_data JSONB NOT NULL, -- Generated personality traits
  system_prompt TEXT NOT NULL, -- LLM system prompt
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(birth_chart_id, planet)
)

-- Chat conversations table
conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES planetary_agents(id),
  title VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Chat messages table
messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  metadata JSONB, -- Token count, model used, etc.
  created_at TIMESTAMP DEFAULT NOW()
)

-- User preferences table
user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  preferences JSONB NOT NULL, -- Theme, notifications, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 3. Core Features

### 3.1 User Authentication & Onboarding

#### 3.1.1 Authentication Flow
- **Sign Up/Sign In:** Email/password via Better Auth & Guest sign in
- **Social Login:** Google, Apple (optional Phase 2)
- **Email Verification:** Required for account activation
- **Password Reset:** Standard flow with email

#### 3.1.2 Onboarding Experience
1. **Welcome Screen:** Brief product introduction
2. **Birth Chart Input:**
   - Date picker for birth date
   - Time picker for birth time (with timezone detection) (AM/PM)
   - Location autocomplete with geocoding
   - Optional: "I don't know my birth time" option
3. **Chart Calculation:** Loading screen with astronomical calculations
4. **Agent Introduction:** Preview of generated planetary agents
5. **First Conversation:** Guided first chat with Sun agent

### 3.2 Birth Chart System

#### 3.2.1 Chart Calculation Engine
```typescript
interface BirthChartData {
  planets: {
    [key: string]: {
      sign: string;
      house: number;
      degree: number;
      retrograde: boolean;
    }
  };
  houses: {
    [key: number]: {
      sign: string;
      degree: number;
    }
  };
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
}
```

#### 3.2.2 Astrological Calculations
- **Planetary Positions:** Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- **House System:** Placidus (primary), Whole Sign (alternative)
- **Aspects:** Major aspects (conjunction, opposition, square, trine, sextile)
- **Orbs:** Standard orbs for each aspect type

#### 3.2.3 Chart Visualization
- **Interactive SVG Chart:** Click planets to select agents
- **Modern Design:** Clean, accessible chart design
- **Responsive:** Works on mobile and desktop
- **Tooltips:** Hover for detailed planet information

### 3.3 AI Agent System

#### 3.3.1 Agent Personas
Each planetary agent has unique characteristics:

**Sun Agent - "Sol"**
- **Archetype:** Core identity, leadership, vitality
- **Communication Style:** Confident, inspiring, warm
- **Topics:** Life purpose, self-expression, creativity, leadership

**Moon Agent - "Luna"**
- **Archetype:** Emotions, intuition, nurturing
- **Communication Style:** Empathetic, gentle, intuitive
- **Topics:** Feelings, memories, comfort, family, dreams

**Mercury Agent - "Hermes"**
- **Archetype:** Communication, intellect, learning
- **Communication Style:** Quick, witty, curious, analytical
- **Topics:** Ideas, communication, learning, travel, siblings

**Venus Agent - "Aphrodite"**
- **Archetype:** Love, beauty, values, relationships
- **Communication Style:** Charming, artistic, harmonious
- **Topics:** Relationships, beauty, art, money, values

**Mars Agent - "Ares"**
- **Archetype:** Action, drive, passion, conflict
- **Communication Style:** Direct, energetic, motivating
- **Topics:** Goals, motivation, anger, sexuality, competition

**Jupiter Agent - "Zeus"**
- **Archetype:** Expansion, wisdom, optimism, growth
- **Communication Style:** Enthusiastic, philosophical, generous
- **Topics:** Growth, education, travel, philosophy, luck

**Saturn Agent - "Chronos"**
- **Archetype:** Structure, discipline, responsibility, lessons
- **Communication Style:** Serious, practical, wise, sometimes stern
- **Topics:** Responsibility, career, discipline, life lessons

**Uranus Agent - "Prometheus"**
- **Archetype:** Innovation, rebellion, uniqueness, change
- **Communication Style:** Eccentric, forward-thinking, rebellious
- **Topics:** Innovation, freedom, technology, rebellion, change

**Neptune Agent - "Poseidon"**
- **Archetype:** Dreams, spirituality, illusion, compassion
- **Communication Style:** Mystical, dreamy, compassionate, sometimes vague
- **Topics:** Dreams, spirituality, art, illusions, compassion

**Pluto Agent - "Hades"**
- **Archetype:** Transformation, power, depth, regeneration
- **Communication Style:** Intense, transformative, powerful, deep
- **Topics:** Transformation, power, death/rebirth, psychology, secrets

#### 3.3.2 Persona Generation Algorithm
```typescript
interface PersonaData {
  coreTraits: string[];
  communicationStyle: string[];
  interests: string[];
  strengths: string[];
  challenges: string[];
  motivations: string[];
  signInfluence: {
    element: string; // fire, earth, air, water
    modality: string; // cardinal, fixed, mutable
    traits: string[];
  };
  houseInfluence: {
    lifeBranding: string;
    focusAreas: string[];
  };
  aspectInfluences: {
    harmonious: string[]; // From trines, sextiles
    challenging: string[]; // From squares, oppositions
  };
}

function generatePersona(planet: string, sign: string, house: number, aspects: Aspect[]): PersonaData {
  // Algorithm combines:
  // 1. Base planetary archetype
  // 2. Zodiac sign modifications
  // 3. House placement context
  // 4. Aspect influences
  // 5. Generate system prompt for LLM
}
```

#### 3.3.3 LLM Integration
- **Model:** OpenAI GPT-4 via Vercel AI SDK
- **Streaming:** Real-time response streaming
- **Context Management:** Maintain conversation history
- **Fallback:** Graceful degradation for API failures
- **Rate Limiting:** Per-user limits to manage costs

### 3.4 Chat Interface

#### 3.4.1 Chat Features
- **Real-time Streaming:** Responses appear as they're generated
- **Message History:** Persistent conversation storage
- **Multiple Conversations:** Create separate chats with each agent
- **Message Actions:** Copy, regenerate, delete messages
- **Conversation Management:** Rename, delete, archive conversations

#### 3.4.2 UI/UX Design
- **Agent Avatars:** Unique visual representation for each planet
- **Typing Indicators:** Show when agent is "thinking"
- **Message Timestamps:** Collapsible timestamps
- **Dark/Light Mode:** User preference toggle
- **Mobile Responsive:** Optimized for all screen sizes

### 3.5 User Dashboard

#### 3.5.1 Dashboard Components
- **Birth Chart Widget:** Interactive chart overview
- **Agent Grid:** Quick access to all planetary agents
- **Recent Conversations:** Continue previous chats
- **Insights Panel:** Astrological insights and daily/weekly guidance
- **Progress Tracking:** Conversation statistics and engagement metrics

#### 3.5.2 Navigation
- **Sidebar Navigation:** Easy access to all features
- **Breadcrumbs:** Clear navigation hierarchy
- **Search:** Find specific conversations or topics
- **Quick Actions:** Floating action button for new conversations

## 4. User Stories

### 4.1 Core User Journeys

#### 4.1.1 New User Registration
```
As a new user,
I want to create an account and input my birth information,
So that I can generate my personalized planetary agents.

Acceptance Criteria:
- User can sign up with email/password
- User inputs birth date, time, and location
- System calculates birth chart accurately
- User sees generated planetary agents
- User can start first conversation immediately
```

#### 4.1.2 Chat with Planetary Agent
```
As a registered user,
I want to chat with my Mars agent about motivation,
So that I can get personalized guidance on taking action.

Acceptance Criteria:
- User can select Mars agent from dashboard
- Chat interface loads with Mars persona active
- Responses reflect Mars archetype + user's chart
- Conversation history is saved
- User can switch between agents seamlessly
```

#### 4.1.3 Explore Birth Chart
```
As a user interested in astrology,
I want to explore my birth chart visually,
So that I can understand my planetary placements better.

Acceptance Criteria:
- Interactive birth chart displays correctly
- Clicking planets shows detailed information
- Chart updates based on user's birth data
- Mobile-responsive design works well
- Chart connects to relevant agent conversations
```

### 4.2 Advanced User Stories

#### 4.2.1 Conversation Management
```
As an active user,
I want to organize my conversations with different agents,
So that I can easily find and continue previous discussions.

Acceptance Criteria:
- User can create multiple conversations per agent
- Conversations can be renamed and organized
- Search functionality works across all messages
- Conversation history is persistent
- User can export conversation data
```

#### 4.2.2 Personalization
```
As a returning user,
I want my agents to remember our previous conversations,
So that our interactions feel continuous and personalized.

Acceptance Criteria:
- Agents reference previous conversations appropriately
- Context is maintained across sessions
- User preferences are remembered
- Conversation style adapts over time
- Privacy controls allow data management
```

## 5. Technical Implementation

### 5.1 Frontend Architecture

#### 5.1.1 Next.js App Structure
```
/app
  /(auth)
    /login
    /signup
    /verify-email
  /(dashboard)
    /dashboard
    /chart
    /agents
    /conversations
    /settings
  /api
    /auth
    /chart
    /agents
    /chat
  /components
    /ui (shadcn/ui components)
    /auth
    /chart
    /chat
    /dashboard
  /lib
    /auth
    /db
    /utils
    /validations
```

#### 5.1.2 State Management
```typescript
// Zustand stores
interface AppState {
  user: User | null;
  birthChart: BirthChart | null;
  agents: PlanetaryAgent[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  preferences: UserPreferences;
}

// Actions
interface AppActions {
  setUser: (user: User) => void;
  setBirthChart: (chart: BirthChart) => void;
  setAgents: (agents: PlanetaryAgent[]) => void;
  addMessage: (message: Message) => void;
  updatePreferences: (prefs: UserPreferences) => void;
}
```

### 5.2 Backend Implementation

#### 5.2.1 Database Setup (Drizzle + Supabase)
```typescript
// drizzle.config.ts
export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;

// Schema definitions
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const birthCharts = pgTable("birth_charts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  birthDate: date("birth_date").notNull(),
  birthTime: time("birth_time").notNull(),
  birthLocation: varchar("birth_location", { length: 255 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).notNull(),
  chartData: jsonb("chart_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### 5.2.2 Authentication (Better Auth)
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

#### 5.2.3 API Routes
```typescript
// app/api/chart/calculate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateBirthChart } from "@/lib/astrology";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { birthDate, birthTime, birthLocation } = body;

  try {
    const chartData = await calculateBirthChart({
      birthDate,
      birthTime,
      birthLocation,
    });

    return NextResponse.json({ chartData });
  } catch (error) {
    return NextResponse.json({ error: "Chart calculation failed" }, { status: 500 });
  }
}

// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messages, agentId } = await req.json();
  
  // Get agent system prompt
  const agent = await getAgentById(agentId);
  
  const result = await streamText({
    model: openai("gpt-4"),
    system: agent.systemPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result.toAIStreamResponse();
}
```

### 5.3 Astrology Calculation System

#### 5.3.1 Chart Calculation Service
```typescript
// lib/astrology/calculator.ts
interface BirthData {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthLocation: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface ChartData {
  planets: Record<string, PlanetData>;
  houses: Record<number, HouseData>;
  aspects: AspectData[];
}

export async function calculateBirthChart(birthData: BirthData): Promise<ChartData> {
  // Use Swiss Ephemeris API or library
  const ephemerisData = await fetchEphemerisData(birthData);
  
  return {
    planets: calculatePlanetaryPositions(ephemerisData),
    houses: calculateHouses(ephemerisData),
    aspects: calculateAspects(ephemerisData),
  };
}
```

#### 5.3.2 Persona Generation
```typescript
// lib/astrology/persona-generator.ts
export function generateAgentPersona(
  planet: string,
  sign: string,
  house: number,
  aspects: AspectData[]
): PersonaData {
  const baseArchetype = PLANETARY_ARCHETYPES[planet];
  const signInfluence = SIGN_INFLUENCES[sign];
  const houseInfluence = HOUSE_INFLUENCES[house];
  const aspectInfluences = calculateAspectInfluences(aspects);

  return {
    coreTraits: combineTraits(baseArchetype.traits, signInfluence.traits),
    communicationStyle: modifyStyle(baseArchetype.style, signInfluence.style),
    interests: combineInterests(baseArchetype.interests, houseInfluence.themes),
    systemPrompt: generateSystemPrompt({
      planet,
      sign,
      house,
      traits: coreTraits,
      style: communicationStyle,
      aspects: aspectInfluences,
    }),
  };
}
```

## 6. Non-Functional Requirements

### 6.1 Performance Requirements
- **Page Load Time:** < 3 seconds for initial load
- **Chat Response Time:** < 5 seconds for AI responses
- **Chart Calculation:** < 10 seconds for birth chart generation
- **Real-time Updates:** < 500ms for message streaming
- **Mobile Performance:** Optimized for 3G networks

### 6.2 Scalability Requirements
- **Concurrent Users:** Support 1,000+ simultaneous users
- **Database Growth:** Handle 1M+ users and 10M+ messages
- **API Rate Limits:** 100 requests/minute per user
- **Storage:** Efficient data storage with compression
- **CDN:** Global content delivery for optimal performance

### 6.3 Security Requirements
- **Authentication:** Multi-factor authentication option
- **Data Encryption:** End-to-end encryption for sensitive data
- **API Security:** Rate limiting, input validation, CORS
- **Privacy:** GDPR compliance, data export/deletion
- **Session Management:** Secure session handling with rotation

### 6.4 Reliability Requirements
- **Uptime:** 99.9% availability target
- **Error Handling:** Graceful degradation for service failures
- **Backup:** Daily automated backups
- **Monitoring:** Real-time error tracking and alerting
- **Disaster Recovery:** Recovery plan for major outages

## 7. Development Phases

### 7.1 Phase 1: MVP Foundation (Weeks 1-4)
**Goal:** Basic working application with core features

**Frontend:**
- Authentication flow (login/signup)
- Birth chart input form
- Basic dashboard layout
- Agent selection interface
- Simple chat interface

**Backend:**
- Database schema implementation
- User authentication system
- Birth chart calculation API
- Basic agent persona generation
- Simple chat API with OpenAI integration

**Deliverables:**
- Working authentication system
- Birth chart calculation and storage
- Basic chat with one agent (Sun)
- Deployed on Vercel

### 7.2 Phase 2: Core Features (Weeks 5-8)
**Goal:** Complete core functionality for all agents

**Frontend:**
- Complete chat interface with streaming
- All 10 planetary agents
- Birth chart visualization
- Conversation management
- Responsive design improvements

**Backend:**
- All agent personas implemented
- Conversation history storage
- Advanced persona generation
- Performance optimizations
- Error handling improvements

**Deliverables:**
- All 10 agents functional
- Visual birth chart display
- Conversation persistence
- Mobile-optimized interface

### 7.3 Phase 3: Enhancement (Weeks 9-12)
**Goal:** Advanced features and polish

**Frontend:**
- Advanced dashboard with insights
- Conversation search and organization
- User preferences and settings
- Onboarding flow improvements
- Animation and micro-interactions

**Backend:**
- Advanced astrology calculations
- Conversation analytics
- Performance monitoring
- Advanced caching strategies
- Security hardening

**Deliverables:**
- Polished user experience
- Advanced astrology features
- Performance optimizations
- Analytics and monitoring

### 7.4 Phase 4: Launch Preparation (Weeks 13-16)
**Goal:** Production readiness and launch

**Tasks:**
- Comprehensive testing (unit, integration, e2e)
- Security audit and penetration testing
- Performance optimization and load testing
- Documentation and user guides
- Marketing site and landing pages
- Beta user testing and feedback incorporation
- Launch preparation and monitoring setup

**Deliverables:**
- Production-ready application
- Comprehensive documentation
- Launch marketing materials
- Monitoring and analytics dashboard

## 8. Success Metrics

### 8.1 User Engagement Metrics
- **Daily Active Users (DAU):** Target 500+ within 3 months
- **Weekly Active Users (WAU):** Target 1,500+ within 3 months
- **Monthly Active Users (MAU):** Target 5,000+ within 6 months
- **Session Duration:** Average 15+ minutes per session
- **Messages per Session:** Average 10+ messages per conversation
- **Return Rate:** 60%+ user return rate within 7 days

### 8.2 Product Metrics
- **Conversion Rate:** 20%+ signup to first chat completion
- **Agent Engagement:** Users chat with 3+ different agents on average
- **Conversation Depth:** 50%+ of conversations have 5+ exchanges
- **Feature Adoption:** 80%+ of users explore birth chart visualization
- **User Satisfaction:** 4.5+ average rating in app stores

### 8.3 Technical Metrics
- **Performance:** 99.9% uptime, <3s average response time
- **Error Rate:** <1% API error rate
- **Scalability:** Handle 10x user growth without performance degradation
- **Security:** Zero critical security vulnerabilities
- **Cost Efficiency:** <$2 per active user per month in infrastructure costs

## 9. Risk Assessment

### 9.1 Technical Risks
- **AI API Costs:** OpenAI costs could scale rapidly with usage
  - *Mitigation:* Implement response caching, optimize prompts, set user limits
- **Astrology Calculation Accuracy:** Complex calculations may have errors
  - *Mitigation:* Use proven Swiss Ephemeris library, extensive testing
- **Performance at Scale:** Chat streaming may not perform well with many users
  - *Mitigation:* Load testing, optimization, proper infrastructure scaling

### 9.2 Product Risks
- **User Adoption:** Target audience may be too niche
  - *Mitigation:* Expand to broader personal development market
- **Persona Quality:** AI agents may not feel authentic or helpful
  - *Mitigation:* Extensive prompt engineering, user feedback loops
- **Astrology Accuracy:** Users may question astrological interpretations
  - *Mitigation:* Use established astrological principles, provide disclaimers

### 9.3 Business Risks
- **Competitive Landscape:** Other AI chat or astrology apps may launch
  - *Mitigation:* Focus on unique value proposition, rapid iteration
- **Regulatory Changes:** AI regulation may impact product features
  - *Mitigation:* Stay informed on regulations, build compliance features
- **Market Timing:** Market may not be ready for this type of product
  - *Mitigation:* Validate with beta users, pivot if necessary

## 10. Future Roadmap

### 10.1 Phase 5: Advanced Features (Months 4-6)
- **Relationship Compatibility:** Compare birth charts between users
- **Transits and Progressions:** Real-time astrological insights
- **Voice Conversations:** Audio chat with planetary agents
- **Group Conversations:** Multiple agents in one conversation
- **Custom Agents:** User-created agents based on asteroids or fixed stars

### 10.2 Phase 6: Community Features (Months 7-9)
- **User Communities:** Connect with others who share similar placements
- **Shared Conversations:** Publish interesting conversations
- **Expert Astrologers:** Connect with professional astrologers
- **Learning Modules:** Educational content about astrology
- **Astrology Events:** Moon phases, planetary transits, etc.

### 10.3 Phase 7: Platform Expansion (Months 10-12)
- **Mobile Apps:** Native iOS and Android applications
- **API Platform:** Allow third-party developers to build on top
- **Enterprise Features:** Team astrology insights for organizations
- **International Expansion:** Support for multiple languages
- **Advanced Analytics:** Deep insights into user patterns and preferences

This PRD provides a comprehensive roadmap for building Astro Agents, combining cutting-edge AI technology with authentic astrological wisdom to create a unique and engaging user experience.
