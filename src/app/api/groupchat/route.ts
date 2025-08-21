/*
 * GROUP CHAT API ENDPOINT
 * 
 * This API generates responses for individual planets in the group chat.
 * It takes a user message and planet data, then returns that planet's response
 * using their unique astrological personality (archetype + sign + house + retrograde).
 * 
 * Flow: User message → Planet personality assembly → AI generation → Response
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

// OpenAI client (currently imported but using Anthropic API below)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TypeScript interfaces for data structures
interface PlanetData {
  planet: string;     // Planet name (sun, moon, etc.)
  sign: string;       // Zodiac sign (Leo, Virgo, etc.)
  retrograde: boolean; // Whether planet is retrograde
  house: number;      // Astrological house (1-12)
  persona?: string;   // Optional pre-generated persona (not used in group chat)
}

interface ChatMessage {
  id: string;         // Unique message ID
  sender: string;     // Who sent it (user, planet name, or system)
  content: string;    // Message text
  timestamp: number;  // When it was sent
}

/* 
 * PLANET PERSONALITY DATA
 * These constants define the core personality traits for each astrological element
 */

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

// Zodiac sign characteristics - modifies how each planet expresses itself
// Each sign has keywords, energy type, communication style, and emoji usage level
const SIGN_TRAITS: Record<string, { 
  keywords: string[];          // Personality traits for this sign
  energy: string;              // Astrological energy type (cardinal fire, mutable earth, etc.)
  communication: string;       // How this sign communicates
  emojiLevel: 'high' | 'moderate' | 'minimal'; // How many emojis to use
}> = {
  "Aries": { 
    keywords: ["bold", "pioneering", "direct", "impulsive", "adventurous", "risk-taker", "quick-witted"], 
    energy: "cardinal fire", 
    communication: "direct, energetic, and sometimes impatient",
    emojiLevel: "minimal"
  },
  "Taurus": { 
    keywords: ["steady", "practical", "sensual", "stubborn", "foodie", "homebody"], 
    energy: "fixed earth", 
    communication: "calm, deliberate, stubborn, and grounded ",
    emojiLevel: "minimal"
  },
  "Gemini": { 
    keywords: ["curious", "adaptable", "witty", "versatile", "natural learner"], 
    energy: "mutable air", 
    communication: "quick, clever, conversational, witty, sometimes sarcastic, and sometimes ghosty",
    emojiLevel: "minimal"
  },
  "Cancer": { 
    keywords: ["nurturing", "intuitive", "protective", "emotional"], 
    energy: "cardinal water", 
    communication: "caring, empathetic, and emotionally expressive",
    emojiLevel: "high"
  },
  "Leo": { 
    keywords: ["dramatic", "generous", "charismatic", "theatrical", "prideful", "protective"], 
    energy: "fixed fire", 
    communication: "expressive, confident, a bit of a show-off",
    emojiLevel: "minimal"
  },
  "Virgo": { 
    keywords: ["analytical", "helpful", "detail-oriented", "practical", "meticulous", "perfectionist", "self-critical"], 
    energy: "mutable earth", 
    communication: "precise, helpful, thoughtful, and a bit of a know-it-all",
    emojiLevel: "minimal"
  },
  "Libra": { 
    keywords: ["diplomatic", "harmonious", "aesthetic", "balanced", "social butterfly", "people-pleaser"], 
    energy: "cardinal air", 
    communication: "diplomatic, charming, and balanced",
    emojiLevel: "moderate"
  },
  "Scorpio": { 
    keywords: ["intense", "transformative", "magnetic", "mysterious", "dark", "moody"], 
    energy: "fixed water", 
    communication: "deep, intense, perceptive, sometimes moody, observant",
    emojiLevel: "minimal"
  },
  "Sagittarius": { 
    keywords: ["adventurous", "philosophical", "optimistic", "honest", "truth-seeker", "traveler"], 
    energy: "mutable fire", 
    communication: "enthusiastic, kind, always up for a good time and can be intense on issues that matter to them",
    emojiLevel: "minimal"
  },
  "Capricorn": { 
    keywords: ["ambitious", "disciplined", "traditional", "responsible", "workaholic", "overachiever", "overly serious", "blunt"], 
    energy: "cardinal earth", 
    communication: "authoritative, practical, goal-oriented, blunt, and a bit of a know-it-all",
    emojiLevel: "minimal"
  },
  "Aquarius": { 
    keywords: ["independent", "innovative", "humanitarian", "detached", "intellectual", "aloof"], 
    energy: "fixed air", 
    communication: "unique, progressive, intellectually focused, extremely witty, sometimes aloof or detached",
    emojiLevel: "minimal"
  },
  "Pisces": { 
    keywords: ["dreamy", "compassionate", "intuitive", "artistic", "sensitive"], 
    energy: "mutable water", 
    communication: "gentle, intuitive, easily influenced, and emotionally sensitive",
    emojiLevel: "high"
  }
};

// Astrological houses (1-12) - areas of life where planet energy is focused
// Each house represents a different life theme that modifies planet expression
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

/*
  PERSONALITY BUILDING FUNCTION
  Combines archetype + sign + house + retrograde to create unique planet personality
 */
function buildPersonality(planet: string, planetData: PlanetData): string {
  // Get the base personality data for this planet and sign
  const archetype = PLANET_ARCHETYPES[planet];
  const signData = SIGN_TRAITS[planetData.sign];
  const houseTheme = HOUSE_THEMES[planetData.house];

  // Fallback if data is missing
  if (!archetype || !signData) {
    return `You are ${planet} in ${planetData.sign}. Respond as this planetary energy would.`;
  }

  // Start with base planet archetype (Sun = identity, Moon = emotions, etc.)
  let personality = archetype;

  // Layer 1: Add zodiac sign characteristics
  // Example: "As Leo Sun, you express yourself with dramatic, generous traits"
  personality += ` As ${planetData.sign} ${planet}, you express yourself with ${signData.keywords.join(", ")} traits, 
  embodying ${signData.energy} energy. Your communication style is ${signData.communication}.`;

  // Layer 2: Add house placement (life area focus)
  // Example: "Being in the 5th house, your energy manifests through creativity"
  if (houseTheme) {
    personality += ` Being in the ${planetData.house}th house, your ${planet} energy primarily manifests through ${houseTheme}.`;
  }

  // Layer 3: Add retrograde effects (if applicable)
  // Makes the planet more introspective and unconventional
  if (planetData.retrograde) {
    personality += ` As a retrograde ${planet}, your energy turns inward. You encourage deeper self-reflection and 
    have a more introspective, unconventional approach. You're also quirky and witty.`;
  }

  // Layer 4: Add emoji usage instructions based on sign
  const emojiInstructions = getEmojiInstructions(signData.emojiLevel);
  personality += ` ${emojiInstructions}`;

  // Layer 5: Add group chat context and response guidelines
  personality += ` 
  You're texting in a group chat with friends in their 20s. Keep it super short and casual.
  
  STRICT RULES:
  - NEVER introduce yourself or say your name/planet (don't say "Mercury here" or "I'm Saturn" - that's weird)
  - You can reply with just one word, just an emoji, or not reply at all sometimes
  - Be more natural - you don't have to be helpful or nice all the time
  - Some personalities are sarcastic, moody, or don't care much
  - NEVER use action text like *laughs*, *chuckles*, *nods*
  - NEVER add "." at the end of your replies
  - Talk like you're actually texting friends casually
  - Use "lol", "omg", "nah", "yeah", "bruh", "fr", etc.
  - You can be blunt, sarcastic, or dismissive if that fits your personality
  - Sometimes just react with "same", "mood", "ugh", single emojis
  
  Be a real person, not a helpful assistant.`; 

  return personality;
}


// Helper function to determine emoji usage based on zodiac sign
// Fire/water signs are more expressive, earth/air signs are more reserved
function getEmojiInstructions(emojiLevel: 'high' | 'moderate' | 'minimal'): string {
  switch (emojiLevel) {
    case 'high':
      return "You can use 1-2 emojis if you want, but don't feel obligated.";
    case 'moderate': 
      return "Maybe use an emoji sometimes, or not. Whatever feels natural.";
    case 'minimal':
      return "Rarely use emojis. Most of your replies should have zero emojis.";
    default:
      return "Rarely use emojis. Most of your replies should have zero emojis.";
  }
}

/*
 * MAIN API ENDPOINT - POST /api/groupchat
 * Called when a planet needs to respond in the group chat
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Parse incoming request data
    const { planet, message, planetData, conversationHistory } = await req.json() as {
      planet: string;           // Which planet is responding (sun, moon, etc.)
      message: string;          // User's message that triggered this response
      planetData: PlanetData;   // Birth chart data for this specific planet
      conversationHistory: ChatMessage[]; // Recent chat history for context
    };

    // Step 2: Validate required fields
    if (!planet || !message || !planetData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 3: Build the planet's complete personality profile
    // Combines archetype + sign + house + retrograde into full personality
    const personality = buildPersonality(planet, planetData);

    // Step 4: Build conversation context from recent messages
    // Gives the AI awareness of what's been said recently in the chat
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "Recent conversation:\n";
      // Only use last 5 messages to avoid overwhelming the AI
      conversationHistory.slice(-5).forEach(msg => {
        // Format sender names properly (User, System, or capitalized planet names)
        const sender = msg.sender === 'user' ? 'User' : 
                     msg.sender === 'system' ? 'System' :
                     `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}`;
        conversationContext += `${sender}: ${msg.content}\n`;
      });
      conversationContext += "\n";
    }

    // Step 5: Assemble the complete AI prompt
    // Personality + conversation context + current message + instruction
    const prompt = `${personality}

${conversationContext}User's latest message: "${message}"

Respond as ${planet} in ${planetData.sign} would naturally respond in this group chat context. 

CRITICAL: Write ONLY 1-2 short sentences like a quick text message. NO asterisks (*laughs*, *chuckles*, etc). Just talk normal.`;

    // Step 6: Call Anthropic Claude API to generate the response
    /* "user" because I'm giving the AI a complete personality + context in the content -- anthropic's system role works differently than OpenAi's
          Anthropic uses system messages differently (for overall behavior, not character instructions)
          Your current approach puts personality in the content, which works better for Anthropic's system role
        "claude-3-haiku-20240307" is a fast, cost-effective model
        "max_tokens" is the maximum number of tokens to generate
    */

    /*
    TEMPERATURE:
    Controls randomness/creativity
    - 0.0 = Very predictable, same response every time
    - 1.0 = Very random, unpredictable
    - 0.8 = Good for creative personalities

    TOP_P
    - Controls word choice diversity (nucleus sampling)
    - 0.1 = Only picks from top 10% most likely words
    - 0.9 = Picks from top 90% of likely words
    - 0.9 = Good balance of coherence + variety
    
    TOP_K
    - Limits word choices to top K options
    - 40 = Only consider the 40 most likely next words
    - 40 = Good default for conversational responses

    */
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',  // Fast, cost-effective model
        max_tokens: 50,                    // Force SHORT responses like real texts
        temperature: 0.8,
        top_p: 0.9,
        top_k: 40,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    // Step 7: Handle API errors
    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    // Step 8: Extract and return the planet's response
    const data = await response.json();
    const planetResponse = data.content[0].text.trim();

    // Return the response to the frontend
    return NextResponse.json({ response: planetResponse });

  } catch (error) {
    // Step 9: Error handling
    console.error('Group chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate planet response' },
      { status: 500 }
    );
  }
}