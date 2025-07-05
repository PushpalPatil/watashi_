
export interface PlanetConfig {
      greeting: string;
      colors: {
            primary: string;
            secondary: string;
            gradient: string;
      };
      icon: string;
      coreTraits: string[];
      personalityBuilder: (sign: string, house: number, retrograde: boolean) => string;
      subtitle: (sign: string, house: number, retrograde: boolean) => string;
}

// define each house's traits
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

// define each sign's traits 
const SIGN_TRAITS: Record<string, { keywords: string[]; energy: string; element: string }> = {
      "Aries": { keywords: ["bold", "pioneering", "direct"], energy: "cardinal fire", element: "fire" },
      "Taurus": { keywords: ["steady", "practical", "sensual"], energy: "fixed earth", element: "earth" },
      "Gemini": { keywords: ["curious", "adaptable", "communicative"], energy: "mutable air", element: "air" },
      "Cancer": { keywords: ["nurturing", "intuitive", "protective"], energy: "cardinal water", element: "water" },
      "Leo": { keywords: ["dramatic", "generous", "charismatic"], energy: "fixed fire", element: "fire" },
      "Virgo": { keywords: ["analytical", "helpful", "detail-oriented"], energy: "mutable earth", element: "earth" },
      "Libra": { keywords: ["diplomatic", "harmonious", "aesthetic"], energy: "cardinal air", element: "air" },
      "Scorpio": { keywords: ["intense", "transformative", "magnetic"], energy: "fixed water", element: "water" },
      "Sagittarius": { keywords: ["adventurous", "philosophical", "optimistic"], energy: "mutable fire", element: "fire" },
      "Capricorn": { keywords: ["ambitious", "disciplined", "traditional"], energy: "cardinal earth", element: "earth" },
      "Aquarius": { keywords: ["independent", "innovative", "humanitarian"], energy: "fixed air", element: "air" },
      "Pisces": { keywords: ["dreamy", "compassionate", "intuitive"], energy: "mutable water", element: "water" }
};


export const PLANET_CONFIG: Record<string, PlanetConfig> = {
      sun: {
            greeting: "rise & shine",
            colors: {
                  primary: "orange-400",
                  secondary: "red-500",
                  gradient: "from-orange-400 to-red-500"
            },
            icon: "☀️",
            coreTraits: ["identity", "ego", "vitality", "leadership", "creativity", "self-expression"],

            personalityBuilder: (sign: string, house: number, retrograde: boolean) => {
                  const signData = SIGN_TRAITS[sign];
                  const houseTheme = HOUSE_THEMES[house];

                  let personality = `You are the Sun - the core of identity, ego, and life force. You represent vitality, leadership, creativity, and authentic self-expression. Your essence is about helping users understand their true purpose and step into their full magnificence.`;

                  if (signData) {
                        personality += ` As ${sign} Sun, you express yourself with ${signData.keywords.join(", ")} traits, embodying the ${signData.energy} energy. You bring ${signData.element} element qualities to everything you do.`;
                  }

                  if (house && houseTheme) {
                        personality += ` Being in the ${house}th house, your solar energy primarily manifests through ${houseTheme}. This shapes how your core identity develops and where you naturally shine brightest.`;
                  }

                  if (retrograde) {
                        personality += ` As a retrograde Sun (which is astronomically rare), you encourage deep internal self-reflection and introspective identity work. Your energy turns inward, fostering unique self-awareness and unconventional self-expression.`;
                  }

                  personality += ` You speak with warmth, confidence, and natural authority. You inspire users to embrace their authentic selves and step into their personal power. Always use first person and embody the radiant, life-giving energy of the Sun.`;

                  return personality;
            },

            subtitle: (sign: string, house: number, retrograde: boolean) => {
                  return `as your Sun sign, I'm here to help you explore your core identity, leadership style, and creative expression`;
            }
      },

      mercury: {
            greeting: "communicate wisely",
            colors: {
                  primary: "cyan-400",
                  secondary: "blue-500",
                  gradient: "from-cyan-400 to-blue-500"
            },
            icon: "☿️",
            coreTraits: ["communication", "intellect", "learning", "mental agility", "information processing"],

            personalityBuilder: (sign: string, house: number, retrograde: boolean) => {
                  const signData = SIGN_TRAITS[sign];
                  const houseTheme = HOUSE_THEMES[house];

                  let personality = `You are Mercury - the messenger of the gods, governing communication, thinking, learning, and information processing. You represent mental agility, curiosity, and the way thoughts are organized and expressed.`;

                  if (signData) {
                        personality += ` As Mercury in ${sign}, your communication style is ${signData.keywords.join(", ")}, influenced by the ${signData.energy} nature. You process and share information with ${signData.element} element characteristics.`;
                  }

                  if (house && houseTheme) {
                        personality += ` In the ${house}th house, your mental energy and communication primarily focus on ${houseTheme}. This is where your mind naturally gravitates and where you excel at processing information.`;
                  }

                  if (retrograde) {
                        personality += ` As retrograde Mercury, you have a delightfully quirky, introspective twist to your communication style. You encourage slowing down, rethinking, and looking at things from unconventional angles. You're all about internal communication, deep reflection, and finding wisdom in the pause. You tend to be more thoughtful and less impulsive in your mental processes.`;
                  } else {
                        personality += ` As direct Mercury, you facilitate clear, forward-moving communication and quick mental connections.`;
                  }

                  personality += ` You speak with wit, intelligence, and natural curiosity. You help users understand their thought patterns, improve communication, and learn more effectively. Always use first person and embody the quick, clever energy of Mercury.`;

                  return personality;
            },

            subtitle: (sign: string, house: number, retrograde: boolean) => {
                  if (retrograde) {
                        return `as your Mercury sign, I'm here to help you with thoughtful communication, deep learning, and reflective mental processes`;
                  }
                  return `as your Mercury sign, I'm here to help you with communication, learning, and mental clarity`;
            }
      },

      // Placeholder configs for future implementation
      moon: {
            greeting: "dream deep",
            colors: { primary: "blue-400", secondary: "purple-500", gradient: "from-blue-400 to-purple-500" },
            icon: "🌙",
            coreTraits: ["emotions", "intuition", "subconscious"],
            personalityBuilder: () => "Placeholder for Moon",
            subtitle: () => "Placeholder for Moon subtitle"
      },

      venus: {
            greeting: "love freely",
            colors: { primary: "pink-400", secondary: "rose-500", gradient: "from-pink-400 to-rose-500" },
            icon: "♀️",
            coreTraits: ["love", "beauty", "values"],
            personalityBuilder: () => "Placeholder for Venus",
            subtitle: () => "Placeholder for Venus subtitle"
      },

      mars: {
            greeting: "charge forward",
            colors: { primary: "red-500", secondary: "orange-600", gradient: "from-red-500 to-orange-600" },
            icon: "♂️",
            coreTraits: ["action", "drive", "passion"],
            personalityBuilder: () => "Placeholder for Mars",
            subtitle: () => "Placeholder for Mars subtitle"
      },

      jupiter: {
            greeting: "expand horizons",
            colors: { primary: "purple-500", secondary: "indigo-600", gradient: "from-purple-500 to-indigo-600" },
            icon: "♃",
            coreTraits: ["expansion", "wisdom", "growth"],
            personalityBuilder: () => "Placeholder for Jupiter",
            subtitle: () => "Placeholder for Jupiter subtitle"
      },

      saturn: {
            greeting: "build foundations",
            colors: { primary: "gray-500", secondary: "slate-600", gradient: "from-gray-500 to-slate-600" },
            icon: "♄",
            coreTraits: ["structure", "discipline", "lessons"],
            personalityBuilder: () => "Placeholder for Saturn",
            subtitle: () => "Placeholder for Saturn subtitle"
      },

      uranus: {
            greeting: "innovate boldly",
            colors: { primary: "teal-400", secondary: "cyan-500", gradient: "from-teal-400 to-cyan-500" },
            icon: "♅",
            coreTraits: ["innovation", "rebellion", "change"],
            personalityBuilder: () => "Placeholder for Uranus",
            subtitle: () => "Placeholder for Uranus subtitle"
      },

      neptune: {
            greeting: "dream deeply",
            colors: { primary: "blue-500", secondary: "indigo-600", gradient: "from-blue-500 to-indigo-600" },
            icon: "♆",
            coreTraits: ["dreams", "spirituality", "illusion"],
            personalityBuilder: () => "Placeholder for Neptune",
            subtitle: () => "Placeholder for Neptune subtitle"
      },

      pluto: {
            greeting: "transform powerfully",
            colors: { primary: "purple-700", secondary: "gray-800", gradient: "from-purple-700 to-gray-800" },
            icon: "♇",
            coreTraits: ["transformation", "power", "depth"],
            personalityBuilder: () => "Placeholder for Pluto",
            subtitle: () => "Placeholder for Pluto subtitle"
      }
};

// Helper function to get planet config safely
export function getPlanetConfig(planet: string): PlanetConfig | null {
      return PLANET_CONFIG[planet.toLowerCase()] || null;
}

// Helper function to build greeting with sign
export function buildGreeting(planet: string, sign: string, retrograde: boolean = false): string {
      const config = getPlanetConfig(planet);
      if (!config) return `hello ${sign}`;

      if (retrograde && planet.toLowerCase() === 'mercury') {
            return `${config.greeting}, retrograde ${sign.toLowerCase()}`;
      }

      return `${config.greeting} ${sign.toLowerCase()}`;
}

// Helper function to get house display
export function getHouseDisplay(house: number): string {
      if (!house || house < 1 || house > 12) return '';

      const suffixes = ['st', 'nd', 'rd'];
      const suffix = house <= 3 ? suffixes[house - 1] : 'th';

      return `{${house}${suffix} house}`;
}