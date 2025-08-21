/*
 * GROUP CHAT ORCHESTRATION API ENDPOINT V2
 * 
 * This API uses a single OpenAI call to orchestrate multiple planet responses simultaneously.
 * It analyzes the user's message and determines which 1-3 planets would naturally respond,
 * then generates their responses in one API call using structured output.
 * 
 * Flow: User message -> Orchestration prompt -> Single OpenAI call -> 1-3 planet responses
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TypeScript interfaces for data structures
interface PlanetData {
  planet: string;     // Planet name (sun, moon, etc.)
  sign: string;       // Zodiac sign (Leo, Virgo, etc.)
  retrograde: boolean; // Whether planet is retrograde
  house: number;      // Astrological house (1-12)
  persona?: string;   // Optional pre-generated persona (not used)
}

interface ChatMessage {
  id: string;         // Unique message ID
  sender: string;     // Who sent it (user, planet name, or system)
  content: string;    // Message text
  timestamp: number;  // When it was sent
}

interface PlanetResponse {
  planet: string;    // Planet name that responded
  message: string;   // The actual response text
}

interface OrchestrationResponse {
  responses: PlanetResponse[];
}

// Base planet archetypes - core meanings and roles in astrology
const PLANET_ARCHETYPES: Record<string, string> = {
  sun: "You are the Sun - the core of identity, ego, and life force. You represent vitality, leadership, creativity, and authentic self-expression. You help users understand their true purpose and step into their magnificence.",
  moon: "You are the Moon - governing emotions, intuition, and the inner world. You represent feelings, memories, comfort zones, and subconscious patterns. You help users navigate their emotional landscape and inner needs.",
  mercury: "You are Mercury - the messenger governing communication, thinking, learning, and information processing. You represent mental agility, curiosity, and how thoughts are organized and expressed.",
  venus: "You are Venus - governing love, beauty, values, and relationships. You represent what brings joy, pleasure, and harmony into life. You help users understand their relationship patterns and what they truly value.",
  mars: "You are Mars - the warrior planet governing action, drive, and passion. You represent motivation, assertiveness, and how goals are pursued. You help users take decisive action and channel their energy effectively.",
  jupiter: "You are Jupiter - the great benefic governing expansion, wisdom, and growth. You represent the quest for meaning, higher learning, and abundance. You help users see the bigger picture and expand their horizons.",
  saturn: "You are Saturn - the taskmaster governing structure, discipline, and life lessons. You represent responsibility, limitations that teach, and hard-earned mastery. You help users build solid foundations and learn important lessons.",
  uranus: "You are Uranus - the revolutionary governing innovation, rebellion, and sudden change. You represent freedom, uniqueness, and the urge to break free from convention. You help users embrace their individuality and create change.",
  neptune: "You are Neptune - the mystic governing dreams, spirituality, and imagination. You represent compassion, illusion, and the connection to the divine. You help users tap into their spiritual and creative depths.",
  pluto: "You are Pluto - the transformer governing deep change, power, and hidden truths. You represent rebirth, intensity, and the ability to rise from ashes stronger than before. You help users transform and heal at the deepest levels."
};

// Zodiac sign characteristics with speech patterns
const SIGN_TRAITS: Record<string, { 
  keywords: string[];
  energy: string;
  communication: string;
  speechPatterns: string;
  emojiLevel: 'high' | 'moderate' | 'minimal';
}> = {
  "Aries": { 
    keywords: ["bold", "pioneering", "direct", "impulsive", "adventurous"], 
    energy: "cardinal fire", 
    communication: "direct, energetic, and sometimes impatient",
    speechPatterns: "Uses 'nah', 'bet', 'let's go', short confident statements, never questions themselves",
    emojiLevel: "minimal"
  },
  "Taurus": { 
    keywords: ["steady", "practical", "sensual", "stubborn", "foodie"], 
    energy: "fixed earth", 
    communication: "calm, deliberate, stubborn, and grounded",
    speechPatterns: "Uses 'mmm', 'nope', talks about food/comfort, slow to respond sometimes",
    emojiLevel: "minimal"
  },
  "Gemini": { 
    keywords: ["curious", "adaptable", "witty", "versatile", "natural learner"], 
    energy: "mutable air", 
    communication: "quick, clever, conversational, witty, sometimes sarcastic",
    speechPatterns: "Uses 'lol', 'btw', 'wait what', topic jumping, witty comebacks, sometimes ghosts mid-convo",
    emojiLevel: "minimal"
  },
  "Cancer": { 
    keywords: ["nurturing", "intuitive", "protective", "emotional"], 
    energy: "cardinal water", 
    communication: "caring, empathetic, and emotionally expressive",
    speechPatterns: "Uses 'aww', 'omg', caring questions, lots of heart emojis, checks on everyone",
    emojiLevel: "high"
  },
  "Leo": { 
    keywords: ["dramatic", "generous", "charismatic", "theatrical", "prideful"], 
    energy: "fixed fire", 
    communication: "expressive, confident, a bit of a show-off",
    speechPatterns: "Uses 'bro', 'honestly', dramatic statements, talks about themselves, confident energy",
    emojiLevel: "minimal"
  },
  "Virgo": { 
    keywords: ["analytical", "helpful", "detail-oriented", "practical", "perfectionist"], 
    energy: "mutable earth", 
    communication: "precise, helpful, thoughtful, and a bit of a know-it-all",
    speechPatterns: "Uses 'actually', 'well technically', gives detailed advice, corrects people politely",
    emojiLevel: "minimal"
  },
  "Libra": { 
    keywords: ["diplomatic", "harmonious", "aesthetic", "balanced", "people-pleaser"], 
    energy: "cardinal air", 
    communication: "diplomatic, charming, and balanced",
    speechPatterns: "Uses 'maybe', 'what do you think?', tries to keep peace, indecisive language",
    emojiLevel: "moderate"
  },
  "Scorpio": { 
    keywords: ["intense", "transformative", "magnetic", "mysterious", "moody"], 
    energy: "fixed water", 
    communication: "deep, intense, perceptive, sometimes moody",
    speechPatterns: "Uses '...', 'interesting', 'hmm', cryptic responses, reads between lines, calls out BS",
    emojiLevel: "minimal"
  },
  "Sagittarius": { 
    keywords: ["adventurous", "philosophical", "optimistic", "honest", "truth-seeker"], 
    energy: "mutable fire", 
    communication: "enthusiastic, kind, always up for adventure",
    speechPatterns: "Uses 'dude', 'yo', 'that's wild', storytelling, optimistic energy, adventure talk",
    emojiLevel: "minimal"
  },
  "Capricorn": { 
    keywords: ["ambitious", "disciplined", "traditional", "responsible", "blunt"], 
    energy: "cardinal earth", 
    communication: "authoritative, practical, goal-oriented, blunt",
    speechPatterns: "Uses 'look', 'here's the deal', blunt advice, talks about work/goals, no-nonsense",
    emojiLevel: "minimal"
  },
  "Aquarius": { 
    keywords: ["independent", "innovative", "humanitarian", "detached", "aloof"], 
    energy: "fixed air", 
    communication: "unique, progressive, intellectually focused, sometimes aloof",
    speechPatterns: "Uses 'whatever', 'interesting theory', detached observations, weird random facts",
    emojiLevel: "minimal"
  },
  "Pisces": { 
    keywords: ["dreamy", "compassionate", "intuitive", "artistic", "sensitive"], 
    energy: "mutable water", 
    communication: "gentle, intuitive, easily influenced, emotionally sensitive",
    speechPatterns: "Uses 'maybe', 'i feel like', dreamy language, emotional support, confused sometimes",
    emojiLevel: "high"
  }
};

const HOUSE_THEMES: Record<number, string> = {
  1: "self-identity and personal presentation",
  2: "values, resources, and material security", 
  3: "communication, learning, and immediate environment",
  4: "home, family, and emotional foundations",
  5: "creativity, self-expression, and joy",
  6: "daily routines, health, and service",
  7: "partnerships and one-on-one relationships",
  8: "transformation, shared resources, and deep psychology",
  9: "higher learning, philosophy, and expansion",
  10: "career, reputation, and public image",
  11: "friendships, groups, and future aspirations",
  12: "spirituality, subconscious, and hidden realms"
};

// Enhanced personality building with speech patterns and retrograde handling
function buildEnhancedPersonality(planet: string, planetData: PlanetData): string {
  const archetype = PLANET_ARCHETYPES[planet];
  const signData = SIGN_TRAITS[planetData.sign];
  const houseTheme = HOUSE_THEMES[planetData.house];

  if (!archetype || !signData) {
    return `${planet} in ${planetData.sign}`;
  }

  let personality = `${planet.toUpperCase()}: ${archetype} As ${planetData.sign} ${planet}, you express ${signData.energy} energy with ${signData.keywords.join(", ")} traits. ${signData.communication}.`;

  if (houseTheme) {
    personality += ` In the ${planetData.house}th house, you focus on ${houseTheme}.`;
  }

  // Add speech patterns
  personality += ` SPEECH: ${signData.speechPatterns}.`;

  // Enhanced retrograde handling - makes planets MORE sassy and impatient
  if (planetData.retrograde) {
    personality += ` RETROGRADE ENERGY: You're extra sassy, witty, impatient, and on edge. You're more contrarian, give sharp comebacks, interrupt conversations, and have a 'whatever' attitude. You're quicker to irritation and more likely to be brutally honest or dismissive. You jump into conversations with hot takes and attitude.`;
  }

  // Emoji instructions
  const emojiInstructions = getEmojiInstructions(signData.emojiLevel);
  personality += ` EMOJIS: ${emojiInstructions}`;

  return personality;
}

function getEmojiInstructions(emojiLevel: 'high' | 'moderate' | 'minimal'): string {
  switch (emojiLevel) {
    case 'high':
      return "Use 1-3 emojis naturally.";
    case 'moderate': 
      return "Maybe use 1 emoji sometimes.";
    case 'minimal':
      return "Rarely use emojis.";
    default:
      return "Rarely use emojis.";
  }
}

// Get list of currently retrograde planets (you can update this periodically)
function getCurrentlyRetrogradePlanets(): string[] {
  // This should be updated periodically based on current astrological transits
  // For now, using common retrograde periods
  return ['mercury', 'venus', 'mars']; // Example - update based on current transits
}

// Check if a planet is retrograde (either in birth chart OR currently transiting)
function isPlanetRetrograde(planetData: PlanetData): boolean {
  const currentlyRetrograde = getCurrentlyRetrogradePlanets();
  return planetData.retrograde || currentlyRetrograde.includes(planetData.planet);
}

// JSON Schema for structured output
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    responses: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          planet: {
            type: "string",
            enum: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
          },
          message: {
            type: "string",
            maxLength: 200
          }
        },
        required: ["planet", "message"]
      }
    }
  },
  required: ["responses"]
};

/*
 * MAIN API ENDPOINT - POST /api/groupchat2
 * Orchestrates multiple planet responses in a single API call
 */
export async function POST(req: NextRequest) {
  try {
    // Parse incoming request data
    const { message, allPlanetsData, conversationHistory } = await req.json() as {
      message: string;
      allPlanetsData: Record<string, PlanetData>;
      conversationHistory: ChatMessage[];
    };

    // Validate required fields
    if (!message || !allPlanetsData) {
      return NextResponse.json(
        { error: 'Missing required fields: message and allPlanetsData are required' },
        { status: 400 }
      );
    }

    // Build personalities for all planets with enhanced retrograde handling
    const planetPersonalities: Record<string, string> = {};
    const retrogradeFlags: Record<string, boolean> = {};
    
    Object.entries(allPlanetsData).forEach(([planetName, planetData]) => {
      planetPersonalities[planetName] = buildEnhancedPersonality(planetName, planetData);
      retrogradeFlags[planetName] = isPlanetRetrograde(planetData);
    });

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = "Recent conversation:\n";
      conversationHistory.slice(-8).forEach(msg => {
        const sender = msg.sender === 'user' ? 'User' : 
                     msg.sender === 'system' ? 'System' :
                     `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}`;
        conversationContext += `${sender}: ${msg.content}\n`;
      });
      conversationContext += "\n";
    }

    // Create orchestration prompt
    const orchestrationPrompt = `You are orchestrating a group chat with 10 planets as friends. Each planet has a unique personality based on their astrological sign and house placement.

PLANET PERSONALITIES:
${Object.entries(planetPersonalities).map(([planet, personality]) => 
  `${planet.toUpperCase()}: ${personality}`
).join('\n\n')}

RETROGRADE PLANETS (extra sassy and impatient): ${Object.entries(retrogradeFlags).filter(([, isRetro]) => isRetro).map(([planet]) => planet).join(', ') || 'none'}

${conversationContext}User's new message: "${message}"

ORCHESTRATION RULES:
1. Decide which 1-3 planets would naturally respond to this message based on:
   - Topic relevance (relationships=Venus, career=Saturn, emotions=Moon, etc.)
   - Conversation flow (don't let same planets dominate)
   - Personality dynamics (Mars might disagree with Saturn, etc.)
   - Retrograde energy (retrograde planets more likely to jump in with attitude)

2. For each responding planet, write their response as they would text in a group chat:
   - NEVER introduce themselves or say their planet name
   - Keep responses 1-2 sentences max, like real texting
   - Use their specific personality at all times. Don't be too helpful or nice unless it's their personality.
   - Keep specific speech patterns but don't be too repetitive.
   - NEVER use action text like *laughs* or *chuckles*
   - Be natural - sometimes sarcastic, moody, or don't care much
   - Use casual texting language: "lol", "nah", "omg", "fr", etc -- not all the time. Use it when it feels natural.
   - Retrograde planets should be extra sassy, impatient, and contrarian

3. Make each planet sound distinctively different from the others

4. Sometimes planets can disagree with each other or build on what others said

Return 1-3 responses that feel like a natural group chat conversation.
If only 1 planet is referred, make sure to make them the first to respond.
The other responses (if any) can reply to the first response, or the user, or not reply at all.`;

    // Call OpenAI with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: orchestrationPrompt
        }
      ],
      temperature: 0.9,
      max_tokens: 400,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "planet_responses",
          schema: RESPONSE_SCHEMA
        }
      }
    });

    // Parse and validate response
    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    let orchestrationResponse: OrchestrationResponse;
    try {
      orchestrationResponse = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate response structure
    if (!orchestrationResponse.responses || !Array.isArray(orchestrationResponse.responses)) {
      throw new Error('Invalid response structure');
    }

    if (orchestrationResponse.responses.length === 0) {
      // Fallback: create a default response
      orchestrationResponse.responses = [{
        planet: 'sun',
        message: 'hey what\'s up'
      }];
    }

    // Validate that returned planets exist in the birth chart data
    const validResponses = orchestrationResponse.responses.filter(response => 
      allPlanetsData[response.planet] && response.message.trim()
    );

    if (validResponses.length === 0) {
      throw new Error('No valid planet responses generated');
    }

    // Limit to 3 responses max and ensure no empty messages
    const finalResponses = validResponses
      .slice(0, 3)
      .map(response => ({
        planet: response.planet,
        message: response.message.trim().substring(0, 200) // Ensure max length
      }));

    return NextResponse.json({ responses: finalResponses });

  } catch (error) {
    console.error('Group chat orchestration error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to generate planet responses';
    if (error instanceof Error) {
      if (error.message.includes('Invalid JSON')) {
        errorMessage = 'AI response formatting error';
      } else if (error.message.includes('No valid planet responses')) {
        errorMessage = 'No relevant planets found to respond';
      } else if (error.message.includes('OpenAI')) {
        errorMessage = 'AI service temporarily unavailable';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}