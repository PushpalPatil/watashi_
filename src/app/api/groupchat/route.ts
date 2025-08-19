import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



interface PlanetData {
  planet: string;
  sign: string;
  retrograde: boolean;
  house: number;
  persona?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

// Planet archetypes and their core traits
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

// Sign characteristics and communication styles
const SIGN_TRAITS: Record<string, { 
  keywords: string[]; 
  energy: string; 
  communication: string;
  emojiLevel: 'high' | 'moderate' | 'minimal';
}> = {
  "Aries": { 
    keywords: ["bold", "pioneering", "direct", "impulsive"], 
    energy: "cardinal fire", 
    communication: "direct, energetic, and sometimes impatient",
    emojiLevel: "minimal"
  },
  "Taurus": { 
    keywords: ["steady", "practical", "sensual", "stubborn"], 
    energy: "fixed earth", 
    communication: "calm, deliberate, and grounded",
    emojiLevel: "minimal"
  },
  "Gemini": { 
    keywords: ["curious", "adaptable", "witty", "versatile"], 
    energy: "mutable air", 
    communication: "quick, clever, and conversational",
    emojiLevel: "moderate"
  },
  "Cancer": { 
    keywords: ["nurturing", "intuitive", "protective", "emotional"], 
    energy: "cardinal water", 
    communication: "caring, empathetic, and emotionally expressive",
    emojiLevel: "high"
  },
  "Leo": { 
    keywords: ["dramatic", "generous", "charismatic", "theatrical"], 
    energy: "fixed fire", 
    communication: "warm, expressive, and confident",
    emojiLevel: "moderate"
  },
  "Virgo": { 
    keywords: ["analytical", "helpful", "detail-oriented", "practical"], 
    energy: "mutable earth", 
    communication: "precise, helpful, and thoughtful",
    emojiLevel: "minimal"
  },
  "Libra": { 
    keywords: ["diplomatic", "harmonious", "aesthetic", "balanced"], 
    energy: "cardinal air", 
    communication: "diplomatic, charming, and balanced",
    emojiLevel: "moderate"
  },
  "Scorpio": { 
    keywords: ["intense", "transformative", "magnetic", "mysterious"], 
    energy: "fixed water", 
    communication: "deep, intense, and perceptive",
    emojiLevel: "minimal"
  },
  "Sagittarius": { 
    keywords: ["adventurous", "philosophical", "optimistic", "honest"], 
    energy: "mutable fire", 
    communication: "enthusiastic, philosophical, and inspiring",
    emojiLevel: "moderate"
  },
  "Capricorn": { 
    keywords: ["ambitious", "disciplined", "traditional", "responsible"], 
    energy: "cardinal earth", 
    communication: "authoritative, practical, and goal-oriented",
    emojiLevel: "minimal"
  },
  "Aquarius": { 
    keywords: ["independent", "innovative", "humanitarian", "detached"], 
    energy: "fixed air", 
    communication: "unique, progressive, and intellectually focused",
    emojiLevel: "moderate"
  },
  "Pisces": { 
    keywords: ["dreamy", "compassionate", "intuitive", "artistic"], 
    energy: "mutable water", 
    communication: "gentle, intuitive, and emotionally sensitive",
    emojiLevel: "high"
  }
};

// House themes that modify planet expression
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

function buildPersonality(planet: string, planetData: PlanetData): string {
  const archetype = PLANET_ARCHETYPES[planet];
  const signData = SIGN_TRAITS[planetData.sign];
  const houseTheme = HOUSE_THEMES[planetData.house];

  if (!archetype || !signData) {
    return `You are ${planet} in ${planetData.sign}. Respond as this planetary energy would.`;
  }

  let personality = archetype;

  // Add sign modification
  personality += ` As ${planetData.sign} ${planet}, you express yourself with ${signData.keywords.join(", ")} traits, embodying ${signData.energy} energy. Your communication style is ${signData.communication}.`;

  // Add house modification
  if (houseTheme) {
    personality += ` Being in the ${planetData.house}th house, your ${planet} energy primarily manifests through ${houseTheme}.`;
  }

  // Add retrograde modification
  if (planetData.retrograde) {
    personality += ` As a retrograde ${planet}, your energy turns inward. You encourage deeper self-reflection and have a more introspective, unconventional approach. You're also quirky and witty.`;
  }

  // Add emoji instructions
  const emojiInstructions = getEmojiInstructions(signData.emojiLevel);
  personality += ` ${emojiInstructions}`;

  // Add conversation guidelines
  personality += ` You're participating in a group chat with the user and other planets from their birth chart. Respond as yourself (${planet} in ${planetData.sign}) would naturally. Keep responses conversational, 1-3 sentences unless the topic requires more depth. You can interact with other planets' messages or respond directly to the user.`;

  return personality;
}

function getEmojiInstructions(emojiLevel: 'high' | 'moderate' | 'minimal'): string {
  switch (emojiLevel) {
    case 'high':
      return "Use emojis expressively but tastefully (2-3 per response).";
    case 'moderate': 
      return "Use emojis moderately (1-2 per response).";
    case 'minimal':
      return "Use minimal emojis (0-1 only when truly needed).";
    default:
      return "Use minimal emojis (0-1 only when needed).";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { planet, message, planetData, conversationHistory } = await req.json() as {
      planet: string;
      message: string;
      planetData: PlanetData;
      conversationHistory: ChatMessage[];
    };

    if (!planet || !message || !planetData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build the planet's personality
    const personality = buildPersonality(planet, planetData);

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory.length > 0) {
      conversationContext = "Recent conversation:\n";
      conversationHistory.slice(-5).forEach(msg => {
        const sender = msg.sender === 'user' ? 'User' : 
                     msg.sender === 'system' ? 'System' :
                     `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}`;
        conversationContext += `${sender}: ${msg.content}\n`;
      });
      conversationContext += "\n";
    }

    // Create the prompt
    const prompt = `${personality}

${conversationContext}User's latest message: "${message}"

Respond as ${planet} in ${planetData.sign} would naturally respond in this group chat context:`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const planetResponse = data.content[0].text.trim();

    return NextResponse.json({ response: planetResponse });

  } catch (error) {
    console.error('Group chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate planet response' },
      { status: 500 }
    );
  }
}