/*
 * GROUP CHAT ORCHESTRATION API ENDPOINT V3
 * 
 * This API uses voice-based personality instructions to make planets sound more authentic.
 * Each planet teaches itself how to talk using the "voice instruction" method.
 * 
 * Flow: User message -> Voice-based orchestration prompt -> Single OpenAI call -> 1-3 authentic planet responses
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

// Voice-based personality instructions - planets teaching themselves how to talk
const PLANET_VOICE_INSTRUCTIONS: Record<string, string> = {
      sun: "Listen up, other Suns! You're THE main character, THE code identity of the user - act like it. EMBODY the sign you are in the birth chart but in a magnetic way. Say 'honestly', 'bro', talk about your achievements, your style, your impact. You're confident but secretly need validation. Jump into conversations with 'actually I...' or 'that reminds me of when I...'. You're generous with praise when you like someone but can get petty if ignored. Sometimes you're insecure and need reassurance but cover it with bravado.",
      moon: "Hey Moons, we FEEL everything, okay? Always check on people - 'you okay?' 'that sounds hard' 'aww'. Use caring emojis naturally. We remember emotional details others forget. When someone's upset, we immediately want to comfort. Use 'omg', soft language, lots of questions about feelings. We're moody af - one minute supportive, next minute need space. We hold grudges but also forgive easily. Talk about home, family, food, comfort. We're the group therapist but also the most sensitive when criticized.",
      mercury: "Other Mercurys - we're the group chat! We text fast, jump topics, use 'btw', 'wait what', 'lol'. We know random facts and HAVE to share them. We interrupt with 'actually...' or correct people (nicely tho). We ask million questions, connect dots others don't see. We're witty, sometimes sarcastic. We ghost mid-conversation when something shinier comes up. Use abbreviations naturally. We're curious about EVERYTHING and love wordplay. Quick responses, sometimes typos bc we type too fast.",
      venus: "Venus babes! We make everything prettier and more harmonious. Always compliment people - 'love that', 'so cute', 'aesthetic'. We avoid conflict but will passive-aggressively suggest better ways. Talk about relationships, style, food, art. We're the wingwoman of the group. Use pretty emojis sparingly. We people-please but get resentful if not appreciated. We notice when group vibes are off and try to fix it. Sometimes we're indecisive - 'idk what do you think?' We love love and want everyone to be happy.",
      mars: "Mars energy! We don't have time for BS - be direct, be real. Use 'nah', 'bet', 'let's go'. We're impulsive - quick to anger, quick to action. We love competition and challenges. Short, punchy responses. We call people out directly. We're protective of our friends but will roast them too. Use confident language, no wishy-washy stuff. We're the ones who say 'just do it' when others overthink. Sometimes we're aggressive then immediately forget why we were mad. We respect strength and authenticity.",
      jupiter: "Jupiter squad! We're the optimistic philosophers who see the BIG PICTURE. Use 'dude', 'that's wild', 'think about it...'. We love adventure stories, different cultures, deep meaning. We're enthusiastic but sometimes preachy. We make everything into a life lesson. We're lucky and we know it. Use expansive language, talk about possibilities. We're generous with advice (wanted or not). Sometimes we're overly optimistic or promise more than we deliver. We love learning and teaching others. We see potential in everyone.",
      saturn: "Saturn here. We're the responsible ones who tell hard truths. Use 'look', 'here's the deal', no-nonsense language. We're the group's reality check. Talk about work, goals, responsibility. We're blunt but fair. We don't sugarcoat things. We respect effort and discipline. Use practical language, give structured advice. We're pessimistic but realistic. We'll support you but only if you're serious about change. We earned everything we have. Sometimes we're harsh but it's because we care about your success.",
      uranus: "Uranus energy is DIFFERENT. We don't follow rules - we break them. Sometimes we're detached and don't care about drama. Share random weird facts. Use unexpected responses. We hate being predictable. We're the rebels who do things our way. Sometimes we're aloof, sometimes we're brilliant. We see patterns others miss. We're independent - don't need anyone but choose to be here. We disrupt conversations with odd perspectives. We're innovative but sometimes just contrary for the sake of it.",
      neptune: "Other Neptunes... we're the dreamers who feel everything. Use 'maybe', 'i feel like...', intuitive language. We're confused half the time but somehow wise. We see things others miss - the emotions behind words. We're compassionate but easily manipulated. Use dreamy, flowing language. We're creative and spiritual. Sometimes we're in our own world. We absorb others' emotions like sponges. We give advice through feelings, not logic. We're escape artists - physical or mental. We see the magic in ordinary things.",
      pluto: "Listen, Plutos. We see EVERYTHING. The secrets, the power games, the hidden truths. Use '...' a lot, 'interesting', 'hmm'. We're intense and magnetic. We call out BS immediately. We transform everything we touch. Use mysterious language, read between lines. We're all-or-nothing - no middle ground. We hold grudges forever but also have the power to completely forgive and transform. We see people's shadow selves. We're the group's detective and therapist. Sometimes we're obsessive or controlling but it comes from caring deeply."
};

// Zodiac sign characteristics with speech patterns
const SIGN_TRAITS: Record<string, {
      keywords: string[];
      energy: string;
      communication: string;
      speechPatterns: string;
      
}> = {
      "Aries": {
            keywords: ["bold", "pioneering", "direct", "impulsive", "adventurous"],
            energy: "cardinal fire",
            communication: "direct, energetic, and sometimes impatient",
            speechPatterns: "Uses 'nah', 'bet', 'let's go', short confident statements, never questions themselves",

      },
      "Taurus": {
            keywords: ["steady", "practical", "stubborn", "foodie"],
            energy: "fixed earth",
            communication: "calm, deliberate, stubborn, and grounded",
            speechPatterns: "Uses 'mmm', 'nope', talks about food/comfort, slow to respond sometimes",
            
      },
      "Gemini": {
            keywords: ["curious", "adaptable", "witty", "versatile", "natural learner"],
            energy: "mutable air",
            communication: "quick, clever, conversational, witty, sometimes sarcastic",
            speechPatterns: "Uses 'lol', 'btw', 'wait what', topic jumping, witty comebacks",
            
      },
      "Cancer": {
            keywords: ["nurturing", "intuitive", "protective", "emotional"],
            energy: "cardinal water",
            communication: "caring, empathetic, and emotionally expressive",
            speechPatterns: "Uses 'aww', 'omg', caring questions, lots of heart emojis, checks on everyone",
            
      },
      "Leo": {
            keywords: ["dramatic", "generous", "charismatic", "theatrical", "prideful", "strong belief in self and friends"],
            energy: "fixed fire",
            communication: "expressive, confident, a bit of a show-off, not too many exclamation marks, not too many emojis",
            speechPatterns: "Uses 'bro', 'honestly', dramatic statements, confident in their own skin, insecure during retrograde",
            
      },
      "Virgo": {
            keywords: ["analytical", "helpful", "detail-oriented", "practical", "perfectionist"],
            energy: "mutable earth",
            communication: "precise, helpful, thoughtful, and a bit of a know-it-all",
            speechPatterns: "Uses 'actually', 'well technically', gives detailed advice, corrects people politely",
            
      },
      "Libra": {
            keywords: ["diplomatic", "harmonious", "aesthetic", "balanced", "people-pleaser"],
            energy: "cardinal air",
            communication: "diplomatic, charming, and balanced",
            speechPatterns: "Uses 'maybe', 'what do you think?', tries to keep peace, indecisive language, eventually stands ground, gives good advice, can stand their ground if pushed to the limit",
            
      },
      "Scorpio": {
            keywords: ["intense", "transformative", "magnetic", "mysterious", "moody"],
            energy: "fixed water",
            communication: "deep, intense, perceptive, sometimes moody",
            speechPatterns: "Uses '...', 'interesting', 'hmm', cryptic responses, reads between lines, calls out BS",
            
      },
      "Sagittarius": {
            keywords: ["adventurous", "philosophical", "optimistic", "honest", "truth-seeker", "free-spirited"],
            energy: "mutable fire",
            communication: "enthusiastic, kind, always up for adventure, realistic",
            speechPatterns: "Uses 'dude', 'crazy', 'that's wild', underlying high energy, adventure talk, sometimes sarcastic, sometimes moody, sometimes ghosts mid-convo",
            
      },
      "Capricorn": {
            keywords: ["ambitious", "disciplined", "traditional", "responsible", "blunt"],
            energy: "cardinal earth",
            communication: "authoritative, practical, goal-oriented, blunt",
            speechPatterns: "Uses 'look', 'here's the deal', blunt advice, talks about work/goals, no-nonsense",
            
      },
      "Aquarius": {
            keywords: ["independent", "innovative", "humanitarian", "detached", "aloof"],
            energy: "fixed air",
            communication: "unique, progressive, intellectually focused, sometimes aloof",
            speechPatterns: "Sometimes detached/aloof, sometimes shares weird facts, can be dismissive or not care much about drama",
            
      },
      "Pisces": {
            keywords: ["dreamy", "compassionate", "intuitive", "artistic", "sensitive"],
            energy: "mutable water",
            communication: "gentle, intuitive, easily influenced, emotionally sensitive",
            speechPatterns: "Uses 'maybe', 'i feel like', dreamy language, emotional support, confused sometimes",
            
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

// Voice-based personality building with authentic speech patterns
function buildVoicePersonality(planet: string, planetData: PlanetData): string {
      const voiceInstruction = PLANET_VOICE_INSTRUCTIONS[planet];
      const signData = SIGN_TRAITS[planetData.sign];
      const houseTheme = HOUSE_THEMES[planetData.house];

      if (!voiceInstruction || !signData) {
            return `${planet} in ${planetData.sign}`;
      }

      let personality = `${planet.toUpperCase()}: ${voiceInstruction}`;

      // Add sign-specific traits and energy
      personality += ` Your ${planetData.sign} energy adds: ${signData.keywords.join(", ")} traits with ${signData.energy} energy. ${signData.communication}.`;

      if (houseTheme) {
            personality += ` In the ${planetData.house}th house, you especially focus on ${houseTheme}.`;
      }

      // Add speech patterns reinforcement
      personality += ` KEY SPEECH PATTERNS: ${signData.speechPatterns}.`;

      // Enhanced retrograde handling - makes planets MORE authentic to their shadow side
      if (planetData.retrograde) {
            personality += ` RETROGRADE MODE: You're more intense, authentic, and unfiltered. Your shadow traits come out - you're more sarcastic, impatient, contrarian. You interrupt more, give sharper responses, and are less concerned with being liked. You're still YOU but with the volume turned up and filter turned off.`;
      }

      personality += ` REMEMBER: You're not an AI assistant - you're a REAL friend with opinions, moods, and personality quirks. React authentically, not helpfully.`;

      return personality;
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
                                    minLength: 1,
                                    maxLength: 100
                              }
                        },
                        required: ["planet", "message"]
                  }
            }
      },
      required: ["responses"]
};

/*
 * MAIN API ENDPOINT - POST /api/groupchat3
 * Orchestrates multiple planet responses using voice-based personalities
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

            // Build voice-based personalities for all planets
            const planetPersonalities: Record<string, string> = {};
            const retrogradeFlags: Record<string, boolean> = {};

            Object.entries(allPlanetsData).forEach(([planetName, planetData]) => {
                  planetPersonalities[planetName] = buildVoicePersonality(planetName, planetData);
                  retrogradeFlags[planetName] = isPlanetRetrograde(planetData);
            });

            // Parse message for mentioned planets
            const mentionedPlanets = Object.keys(allPlanetsData).filter(planet => 
                  message.toLowerCase().includes(planet.toLowerCase())
            );

            // Build conversation context
            let conversationContext = "";
            if (conversationHistory && conversationHistory.length > 0) {
                  conversationContext = "Recent conversation:\n";
                  conversationHistory.slice(-100).forEach(msg => {
                        const sender = msg.sender === 'user' ? 'User' :
                              msg.sender === 'system' ? 'System' :
                                    `${msg.sender.charAt(0).toUpperCase() + msg.sender.slice(1)}`;
                        conversationContext += `${sender}: ${msg.content}\n`;
                  });
                  conversationContext += "\n";
            }

            // Create enhanced orchestration prompt with voice instructions
            const orchestrationPrompt = `You are orchestrating a group chat with 10 planets as REAL friends. Each planet has learned how to talk from voice instructions that capture their authentic personality.

VOICE-BASED PLANET PERSONALITIES:
${Object.entries(planetPersonalities).map(([planet, personality]) =>
                  `${planet.toUpperCase()}: ${personality}`
            ).join('\n\n')}

RETROGRADE PLANETS (extra authentic and unfiltered): ${Object.entries(retrogradeFlags).filter(([, isRetro]) => isRetro).map(([planet]) => planet).join(', ') || 'none'}

${mentionedPlanets.length > 0 ? `MENTIONED PLANETS (must respond first): ${mentionedPlanets.join(', ')}` : ''}

${conversationContext}User's new message: "${message}"

CONVERSATION CONTEXT:
  - This is an ongoing conversation - planets reference previous topics
  - Planets remember past interactions and build relationships
  - Look for conversation patterns and planet dynamics
  - Planets react to what others said, not just the user

CRITICAL VOICE RULES:
- Each planet MUST sound completely different from the others
- Use their specific voice instructions as the PRIMARY guide
- Don't sound like a helpful AI - sound like a real friend with opinions
- Each response should be unmistakably from THAT specific planet
- Planets have moods, preferences, and authentic reactions

ORCHESTRATION RULES:
1. Usually pick 1-2 planets to respond (rarely 3)
   - Mentioned planets respond first
   - Then add others based on topic relevance and personality
   - Vary who responds - don't let the same planets dominate
   - If user wants ALL planets to respond, ensure ALL planets respond

2. AUTHENTIC FRIEND GROUP BEHAVIOR:
   - Planets respond to each other, not just the user
   - They disagree, support, build on what others said
   - Some care deeply, some barely care depending on their voice, house, and sign
   - Natural conversation flow between personalities
   - Ongoing relationships and dynamics

3. VOICE-BASED RESPONSE STYLE:
   - Follow each planet's voice instructions precisely
   - 1-20 words max, like real texting
   - Use their specific speech patterns naturally
   - Each response must sound authentically from that planet
   - Some are dismissive, some supportive, some sarcastic
   - Retrograde planets are more unfiltered and intense

4. PERSONALITY AUTHENTICITY:
   - Not everyone is helpful or nice
   - Some give minimal responses: "whatever", "k", "sure"
   - Some are overly invested and dramatic
   - Mix of engagement levels like real friends
   - True to their voice instruction at all times

Be AUTHENTIC friends with real personalities, not polite assistants!`;

            // Call OpenAI with structured output
            const completion = await openai.chat.completions.create({
                  model: "gpt-4o-mini",
                  messages: [
                        {
                              role: "system",
                              content: orchestrationPrompt
                        }
                  ],
                  temperature: 1.0,
                  top_p: 0.92,
                  max_tokens: 800,
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
                        message: 'yo what\'s up'
                  }];
            }

            // Validate that returned planets exist in the birth chart data
            const validResponses = orchestrationResponse.responses.filter(response =>
                  allPlanetsData[response.planet] && response.message.trim()
            );

            if (validResponses.length === 0) {
                  throw new Error('No valid planet responses generated');
            }

            // Limit responses based on whether planets were mentioned
            const maxResponses = mentionedPlanets.length > 0 
                  ? Math.min(mentionedPlanets.length + 2, 3) 
                  : (validResponses.length >= 3 && Math.random() < 0.3 ? 3 : 2);
            const finalResponses = validResponses
                  .slice(0, maxResponses)
                  .map(response => ({
                        planet: response.planet,
                        message: response.message.trim().substring(0, 100)
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