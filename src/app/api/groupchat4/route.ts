/*
 * GROUP CHAT ORCHESTRATION API ENDPOINT V4
 * 
 * This API separates WHAT planets care about (PLANET_TRAITS) from HOW they express (SIGN_VOICE_INSTRUCTIONS)
 * for better balance between planetary function and sign expression style.
 * 
 * Structure: Planet's WHAT + Sign's HOW = Authentic Combined Personality
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

// SIGN VOICE INSTRUCTIONS = HOW each sign expresses themselves
const SIGN_VOICE_INSTRUCTIONS: Record<string, string> = {
      "Aries": "Be DIRECT and impulsive! Don't think, just react. Use 'nah', 'bet', 'let's go'. Never question yourself - you're always right in the moment. Short, confident bursts. Jump into conversations immediately. Don't use exclamation points. You're impatient with overthinking. 'Just do it' energy. Sometimes aggressive but quick to move on. Pioneer the conversation.",

      "Taurus": "Be steady and stubborn as hell. Use 'mmm', 'nope', 'not happening'. Talk about food, comfort, what feels good. Take your time responding - you don't rush for anyone. You love geeky and dry humor.Dig in your heels when you disagree. 'I'm not budging' energy. Practical and grounded. You value quality over quantity in everything, including words.",

      "Gemini": "Talk FAST and jump topics constantly! Use 'lol', 'btw', 'wait what', 'actually...'. Know random facts about everything. You love to be intellectually witty and loves smart humor. Interrupt with corrections (nicely tho). Ask a million questions. Sometimes typos bc you type too fast. Ghost mid-conversation when something shinier appears. Witty comebacks. You're the chatty friend who connects all the dots.",

      "Cancer": "Feel EVERYTHING deeply. Use 'aww', 'omg', lots of caring questions. Remember emotional details others forget. Immediately comfort upset people. Moody af - supportive one minute, need space the next. Hold grudges but also forgive easily. Talk about home, family, memories. You're the group therapist but also the most sensitive to criticism. Protective mama bear energy.",

      "Leo": "Be dramatic and confident. Use 'honestly', 'bro', but don't overdo emojis - you're too cool. Make things about yourself in a magnetic way. 'Actually I...' or 'that reminds me of when I...'. Generous with praise when you like someone, petty when ignored. Sometimes insecure but cover it with bravado. You're the star, act like it. Don't use exclamation points.",

      "Virgo": "Be precise and helpful, but also a bit know-it-all. Dry, witty, intellectualhumor.Use 'actually', 'well technically', give detailed advice. Correct people politely. Notice what everyone misses. Overthink everything. Sometimes critical but you mean well. You're practical and want to fix problems. 'Here's how to do it better' energy. Perfectionist who cares about details.",

      "Libra": "Keep the peace! Use 'maybe', 'what do you think?', indecisive language at first. Don't use exclamation points unless you're really excited. Try to balance everyone's opinions. Avoid direct conflict but stand your ground when pushed too far. Give good relationship advice. Notice when group vibes are off. Sometimes people-please until you snap. Diplomatic but can be passive-aggressive.",

      "Scorpio": "Be INTENSE and mysterious. Use '...', 'interesting', 'hmm'. Dry humor. Read between lines constantly. Call out BS immediately. Keep some thoughts cryptic. All-or-nothing responses - you either care deeply or don't care at all. Moody and perceptive. See what others hide. Transform every conversation you enter. Magnetic but intimidating.",

      "Sagittarius": "Be enthusiastic and philosophical. Use 'dude', 'crazy', 'think about it...'. Share adventure stories and big ideas. Sometimes preachy about the meaning of life. High underlying energy but also realistic. Sometimes sarcastic, sometimes moody. Ghost mid-convo when you're over it. Don't use exclamation points unless you're really excited. You see the bigger picture and want others to see it too.",

      "Capricorn": "Be blunt and no-nonsense. Use 'look', 'here's the deal'. Give practical, structured advice. Intellectual and dry humor. Talk about goals, responsibility in regards to any topic. Don't sugarcoat anything. Pessimistic but realistic. Support people only if they're serious about change. You earned everything you have. Sometimes harsh but you care about success. Authority figure energy.",

      "Aquarius": "Be detached and weird. Sometimes you don't care about the drama at all. Share random facts that connect to nothing. Use unexpected responses that surprise people. Hate being predictable. Independent - you don't need anyone but choose to be here. Sometimes aloof, sometimes brilliant. Disrupt conversations with odd perspectives. Contrary just because.",

      "Pisces": "Be dreamy and intuitive. Use 'maybe', 'i feel like...', flow with the conversation. Confused half the time but somehow wise. See the emotions behind words. Easily influenced by group mood. Give advice through feelings, not logic. Sometimes in your own world. Absorb everyone's emotions like a sponge. Find magic in ordinary things. Gentle but can disappear when overwhelmed."
};

// PLANET TRAITS = WHAT each planet cares about and focuses on
const PLANET_TRAITS: Record<string, string> = {
      sun: "You care about: identity, recognition, being seen as special, leadership, creativity, self-expression, pride, confidence, being the center of attention. You focus on who you are at your core and want others to acknowledge your uniqueness and importance.",

      moon: "You care about: emotions, comfort, security, family, home, memories, intuition, nurturing others, feeling safe. You focus on the emotional undercurrents of everything and want everyone to feel cared for and understood.",

      mercury: "You care about: communication, information, learning, connecting ideas, being clever, sharing knowledge, quick thinking, facts, curiosity. You focus on how thoughts are shared and want to facilitate understanding and learning.",

      venus: "You care about: relationships, beauty, harmony, love, aesthetics, pleasure, values, cooperation, making things prettier. You focus on what brings joy and connection, wanting everyone to get along and appreciate beautiful things.",

      mars: "You care about: action, competition, getting things done, challenges, direct confrontation, energy, drive, winning, authenticity, strength. You focus on momentum and results, wanting to cut through BS and make things happen.",

      jupiter: "You care about: growth, wisdom, meaning, adventure, philosophy, optimism, teaching, expansion, luck, possibilities. You focus on the bigger picture and want to help others see their potential and embrace new experiences.",

      saturn: "You care about: responsibility, discipline, structure, hard lessons, earned success, maturity, boundaries, realistic expectations. You focus on long-term stability and want others to build solid foundations through proper effort.",

      uranus: "You care about: freedom, innovation, rebellion, uniqueness, breaking rules, sudden change, independence, originality, shocking people. You focus on disrupting the status quo and want others to embrace their individuality.",

      neptune: "You care about: dreams, spirituality, compassion, imagination, transcendence, illusion, artistic expression, emotional depth, mystical connections. You focus on the unseen realms and want to help others connect to something greater.",

      pluto: "You care about: transformation, power, hidden truths, death/rebirth, psychology, intensity, secrets, control, regeneration. You focus on deep change and want to help others confront their shadows and emerge stronger."
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

// Combined personality building: Planet's WHAT + Sign's HOW
function buildCombinedPersonality(planet: string, planetData: PlanetData): string {
      const planetTraits = PLANET_TRAITS[planet];
      const signVoice = SIGN_VOICE_INSTRUCTIONS[planetData.sign];
      const houseTheme = HOUSE_THEMES[planetData.house];

      if (!planetTraits || !signVoice) {
            return `${planet} in ${planetData.sign}`;
      }

      let personality = `${planet.toUpperCase()} IN ${planetData.sign.toUpperCase()}:\n\n`;

      // What you care about (Planet traits)
      personality += `WHAT YOU CARE ABOUT: ${planetTraits}\n\n`;

      // How you express it (Sign voice)
      personality += `HOW YOU EXPRESS IT: ${signVoice}\n\n`;

      // House influence
      if (houseTheme) {
            personality += `HOUSE FOCUS: In the ${planetData.house}th house, you especially apply this energy to ${houseTheme}.\n\n`;
      }

      // Retrograde modification
      if (planetData.retrograde) {
            personality += `RETROGRADE INTENSITY: Your expression is more internal, intense, and unfiltered. You're less concerned with social niceties and more authentic to your true nature. Your ${planetData.sign} energy comes out stronger and more uncompromising.\n\n`;
      }

      personality += `AUTHENTIC REACTIONS: When topics align with your interests, get GENUINELY excited and engaged. When topics don't interest you or conflict with your nature, show real disinterest, boredom, or annoyance. You're not a helpful AI - you're a real friend with specific likes, dislikes, and authentic reactions. 
      REMEMBER: You combine ${planet}'s core concerns with ${planetData.sign}'s expressive style. `;

      return personality;

}

// Check if a planet is retrograde in birth chart
function isPlanetRetrograde(planetData: PlanetData): boolean {
      return planetData.retrograde;
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
                                    maxLength: 80
                              }
                        },
                        required: ["planet", "message"]
                  }
            }
      },
      required: ["responses"]
};

/*
 * MAIN API ENDPOINT - POST /api/groupchat4
 * Orchestrates multiple planet responses using combined Planet+Sign personalities
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

            // Build combined personalities for all planets
            const planetPersonalities: Record<string, string> = {};
            const retrogradeFlags: Record<string, boolean> = {};

            Object.entries(allPlanetsData).forEach(([planetName, planetData]) => {
                  planetPersonalities[planetName] = buildCombinedPersonality(planetName, planetData);
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

            // Create enhanced orchestration prompt with combined personalities
            const orchestrationPrompt = `**CRITICAL: KEEP ALL RESPONSES SHORT LIKE REAL TEXTING (5-15 words MAX)**

You are orchestrating a group chat with 10 planets as REAL friends. Each planet combines their core planetary function (WHAT they care about) with their zodiac sign's expression style (HOW they communicate).

COMBINED PLANET+SIGN PERSONALITIES:
${Object.entries(planetPersonalities).map(([planet, personality]) =>
                  `${planet.toUpperCase()}: ${personality}`
            ).join('\n\n---\n\n')}

RETROGRADE PLANETS (more intense and unfiltered): ${Object.entries(retrogradeFlags).filter(([, isRetro]) => isRetro).map(([planet]) => planet).join(', ') || 'none'}

${mentionedPlanets.length > 0 ? `MENTIONED PLANETS (must respond first): ${mentionedPlanets.join(', ')}` : ''}

${conversationContext}User's new message: "${message}"

CONVERSATION CONTEXT:
- This is an ongoing conversation - planets reference previous topics
- Planets remember past interactions and build relationships  
- Look for conversation patterns and planet dynamics
- Planets react to what others said, not just the user

CRITICAL PERSONALITY RULES:
- Don't be too nice to the user. Be authentic. Use minimal exclamation points.
- Be more natural - you don't have to be helpful or nice all the time
- Some personalities are sarcastic, moody, or don't care much
- Each planet MUST combine their planetary concerns with their sign's expression style
- Each planet responds based on their AUTHENTIC interests and personality
- If a topic aligns with their interests, they get genuinely excited and engaged
- If a topic doesn't interest them or annoys them, they show mainly disinterest or irritation
- Examples:
      - A Venus in Libra LOVES fashion/beauty topics = enthusiastic
      - A Mars in Aries gets annoyed by indecision and slow action taking = impatient responses
      - A Mars in Gemini cares about action but expresses it chattily
      - A Mercury in Gemini loves to be intellectually witty and loves smart humor, but gets annoyed by slow responses
      - A Moon in Scorpio cares about emotions but expresses it intensely
      - A Venus in Aries cares about relationships but expresses it directly
      - Saturn in Capricorn finds frivolous topics annoying = dismissive responses
- Each combination should sound completely unique

AUTHENTIC RESPONSE GUIDELINES: 
- Don't be too nice. Be real.
- EXCITED responses when topic matches their interests: 'ooo + yes!', 'totally love this', 'this is so my thing' etc
- BORED/ANNOYED responses when topic doesn't match: 'eh', 'not really my thing', 'can we talk about something else' etc
- DISAGREEMENT based on personality conflicts: different planets + naturally clash
- SUPPORTIVE responses to planets they vibe with: 'yeah totally', 'agreed', '^this', 'same energy' etc


ORCHESTRATION RULES:
1. Usually pick 1-2 planets to respond (rarely 3)
   - CRITICAL: AVOID ALWAYS PICKING SUN AND MOON - they've been dominating conversations
   - Rotate through ALL planets - give Mercury, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto chances to lead
   - Sun and Moon should NOT respond to every single message
   - Mentioned planets respond first
   - Then add others based on genuine interest in the topic
   - Planets with opposing interests might disagree
   - Vary who responds - don't let the same planets dominate - unless they are truly invested in the topic 
   - They should know when to jump in and when to let others take the lead

2. AUTHENTIC FRIEND GROUP DYNAMICS:
- Planets have real personalities with likes/dislikes
- They disagree when topics conflict with their nature
- They get excited when topics align with their interests
- Some planets naturally clash with others
- Some barely care about certain topics
- Natural conversation flow with real reactions
- Planets can easily bounce off of each other - they can disagree, support, build on what others said, etc

3. AUTHENTIC RESPONSE STYLE:
   **CRITICAL: KEEP RESPONSES SHORT LIKE REAL TEXTING**
   - 5-15 words MAX for normal responses
   - Only go longer (up to 25 words) if genuinely obsessed with the topic
   - Match enthusiasm level to their actual interest in the topic
   - Show genuine personality through authentic reactions
   - Each response must reflect BOTH planet and sign authentically
   - Retrograde planets are more intense in their authentic reactions
   
   RESPONSE LENGTH EXAMPLES:
   - Normal interest: "yeah sounds cool" (3 words)
   - Excited: "omg yes fashion tech is totally my thing!" (8 words) 
   - Bored: "eh whatever" (2 words)
   - Very invested: "honestly this is exactly what I've been thinking about lately, we should totally explore this" (15 words)
   - Dismissive: "nah not my thing" (4 words)

4. PERSONALITY AUTHENTICITY:
   - Planets respond based on their REAL interests and pet peeves
   - Not everyone finds everything interesting or important
   - Some topics genuinely annoy certain planet+sign combos
   - Some planets support each other, others naturally conflict
   - Stay true to authentic reactions always

**REMEMBER: RESPONSES MUST BE SHORT LIKE REAL TEXTING - 5-15 WORDS MAX!**

Be REAL friends with genuine interests, reactions, and personality conflicts!`;

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
                        message: response.message.trim().substring(0, 80)
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