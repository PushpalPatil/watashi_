"use client";

import { PLANET_CONFIG } from '@/lib/planet-config';
import { useStore } from '@/store/storeInfo';
import React, { useEffect, useRef, useState } from 'react';

interface BirthChartPopupProps {
  onClose?: () => void;
  className?: string;
  mode?: 'popup' | 'drawer';
  isOpen?: boolean;
}

export function BirthChartPopup({ onClose, className = "", mode = 'popup', isOpen = true }: BirthChartPopupProps) {
  const { planets } = useStore();
  const [isVisible, setIsVisible] = useState(mode === 'popup' ? true : false);
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Drawer-specific state
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Update visibility based on mode and isOpen prop
  useEffect(() => {
    if (mode === 'drawer') {
      setIsVisible(isOpen || false);
    }
  }, [mode, isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Drawer drag functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mode !== 'drawer') return;
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (mode !== 'drawer' || !isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (mode !== 'drawer' || !isDragging) return;
    const deltaX = currentX - startX;

    // Swipe right OR left to close (more than 100px in either direction)
    if (Math.abs(deltaX) > 100) {
      handleClose();
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'drawer') return;
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (mode !== 'drawer' || !isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (mode !== 'drawer' || !isDragging) return;
    const deltaX = currentX - startX;

    // Swipe right OR left to close (more than 100px in either direction)
    if (Math.abs(deltaX) > 100) {
      handleClose();
    }

    setIsDragging(false);
    setStartX(0);
    setCurrentX(0);
  };

  useEffect(() => {
    if (mode === 'drawer' && isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [mode, isDragging, currentX, startX]);

  const togglePlanetDescription = (planetName: string) => {
    setExpandedPlanet(expandedPlanet === planetName ? null : planetName);
  };

  const getPlanetDescription = (planetName: string, sign: string) => {
    const config = PLANET_CONFIG[planetName];
    if (!config) return '';

    const planetData = planets[planetName];
    if (!planetData) return '';

    // Generate detailed Co-Star style descriptions of how the sign affects the planet
    const getSignModification = (planet: string, sign: string) => {
      const signEffects: Record<string, Record<string, string>> = {
        sun: {
          Aries: "burns bright and direct. You lead with confidence and aren't afraid to be first. Your identity is tied to action and pioneering new paths.",
          Taurus: "radiates steady, grounded energy. You present yourself as reliable and sensual, finding identity through stability and material comfort.",
          Gemini: "sparkles with curiosity and adaptability. Your identity shifts like quicksilver - you're the eternal student, always learning and communicating.",
          Cancer: "glows with emotional depth and nurturing energy. You lead with intuition and care, finding identity through protecting others.",
          Leo: "blazes with dramatic flair and natural magnetism. You can't help but shine - your identity is performance, creativity, and being seen.",
          Virgo: "illuminates through precision and service. You find identity in perfectionism, analysis, and making things better.",
          Libra: "shines through harmony and aesthetic beauty. Your identity is tied to relationships, balance, and creating peace around you.",
          Scorpio: "burns with mysterious intensity. You lead with depth and transformation - your identity is forged through emotional extremes.",
          Sagittarius: "blazes with philosophical fire. Your identity expands through wisdom, travel, and seeking higher meaning.",
          Capricorn: "rises with disciplined ambition. You build your identity through achievement, structure, and earning respect.",
          Aquarius: "pulses with electric originality. Your identity is rebellion, innovation, and being refreshingly different.",
          Pisces: "flows with intuitive compassion. Your identity dissolves boundaries - you lead through empathy and spiritual connection."
        },
        moon: {
          Aries: "reacts instantly and intensely. Your emotions are immediate and honest - you feel everything as urgency and need action to process.",
          Taurus: "needs stability and sensual comfort. Your emotions crave routine, beauty, and physical security to feel safe.",
          Gemini: "processes feelings through words and constant mental stimulation. You need variety and intellectual connection to feel emotionally satisfied.",
          Cancer: "feels everything deeply and personally. Your emotions are protective, nostalgic, and need familiar environments to flourish.",
          Leo: "requires attention and dramatic expression. Your feelings need to be seen, celebrated, and validated to feel secure.",
          Virgo: "analyzes emotions and seeks practical solutions. You feel secure through organization, helping others, and having everything in order.",
          Libra: "needs harmony and aesthetic beauty. Your emotions crave balance, partnership, and pleasant environments to feel at peace.",
          Scorpio: "experiences feelings as intense transformation. Your emotions run deep and need privacy, loyalty, and emotional truth to feel safe.",
          Sagittarius: "seeks emotional freedom and philosophical meaning. You need adventure, optimism, and big-picture thinking to feel secure.",
          Capricorn: "structures emotions and needs achievement. You feel secure through responsibility, tradition, and building something lasting.",
          Aquarius: "detaches from overwhelming feelings and needs intellectual space. Your emotions require freedom and unconventional expression.",
          Pisces: "absorbs everything around you like an emotional sponge. You need spiritual connection and creative outlets to process feelings."
        },
        mercury: {
          Aries: "thinks and speaks with rapid-fire directness. Your mind moves fast, cuts to the point, and has no patience for slow conversations.",
          Taurus: "processes information slowly and thoroughly. Your thoughts are deliberate, practical, and focused on what's tangible and useful.",
          Gemini: "connects ideas at lightning speed. Your mind jumps between topics, loves wordplay, and needs constant mental stimulation.",
          Cancer: "thinks through emotional intuition. Your communication is caring, memory-driven, and influenced by how things feel.",
          Leo: "communicates with dramatic flair and confidence. Your thoughts are creative, expressive, and need an appreciative audience.",
          Virgo: "analyzes every detail with surgical precision. Your mind notices what others miss and communicates through helpful correction.",
          Libra: "weighs all sides before speaking. Your thoughts seek balance and your communication aims to create harmony and fairness.",
          Scorpio: "penetrates to hidden meanings and psychological depths. Your mind investigates secrets and communicates intense truths.",
          Sagittarius: "thinks in big-picture philosophies. Your communication is enthusiastic, broad-minded, and seeks deeper meaning.",
          Capricorn: "structures thoughts practically and speaks with authority. Your mind focuses on long-term strategy and realistic solutions.",
          Aquarius: "thinks in innovative patterns that surprise others. Your communication is detached, original, and ahead of its time.",
          Pisces: "processes through intuitive, non-linear understanding. Your thoughts flow like water and communication is empathetic and artistic."
        },
        venus: {
          Aries: "loves boldly and directly. You're attracted to confidence and excitement - your affection is passionate but can burn out quickly.",
          Taurus: "seeks lasting, sensual pleasure. You value stability, luxury, and physical beauty - your love is steady and possessive.",
          Gemini: "falls for wit and mental stimulation. You're attracted to intelligence and variety - your affection needs constant conversation.",
          Cancer: "loves through nurturing protection. You value emotional security and family - your affection is caring but moody.",
          Leo: "desires grand romantic gestures. You're attracted to creativity and drama - your love needs to feel special and admired.",
          Virgo: "shows love through practical service. You value competence and improvement - your affection expresses through helpful acts.",
          Libra: "seeks perfect romantic harmony. You're attracted to beauty and balance - your love needs partnership and aesthetic pleasure.",
          Scorpio: "loves with consuming intensity. You value emotional depth and loyalty - your affection is transformative and exclusive.",
          Sagittarius: "needs freedom within love. You're attracted to adventure and wisdom - your affection requires space and shared philosophy.",
          Capricorn: "builds love through commitment and respect. You value ambition and stability - your affection is serious and long-term focused.",
          Aquarius: "loves unconventionally and independently. You're attracted to uniqueness and friendship - your affection needs intellectual connection.",
          Pisces: "dissolves boundaries through compassionate love. You value spiritual connection - your affection is selfless and emotionally intuitive."
        },
        mars: {
          Aries: "acts with pure, unfiltered aggression. Your drive is immediate, competitive, and thrives on challenge and physical action.",
          Taurus: "moves with stubborn, steady determination. Your energy builds slowly but becomes unstoppable once committed to action.",
          Gemini: "channels energy through mental agility and scattered focus. Your drive needs variety and intellectual challenges to stay motivated.",
          Cancer: "protects fiercely when emotionally triggered. Your energy is defensive, intuitive, and strongest when defending loved ones.",
          Leo: "acts with dramatic confidence and creative force. Your drive needs recognition and self-expression to feel energized.",
          Virgo: "directs energy through precise, methodical improvement. Your drive focuses on perfection and practical problem-solving.",
          Libra: "struggles with direct action but fights for fairness. Your energy seeks balance and partnership in all endeavors.",
          Scorpio: "pursues goals with transformative intensity. Your drive is strategic, obsessive, and capable of incredible regeneration.",
          Sagittarius: "charges toward philosophical horizons. Your energy needs adventure, meaning, and freedom to operate at full power.",
          Capricorn: "climbs steadily toward long-term achievement. Your drive is disciplined, ambitious, and focused on building lasting success.",
          Aquarius: "rebels against conventional methods. Your energy is erratic but brilliant, motivated by innovation and social change.",
          Pisces: "flows around obstacles with intuitive strategy. Your drive is compassionate, artistic, and strongest when helping others."
        },
        jupiter: {
          Aries: "expands through bold action and pioneering spirit. Your growth comes from taking risks, leading others, and fearlessly exploring new territories.",
          Taurus: "grows through steady accumulation and sensual wisdom. Your expansion is grounded, practical, and focused on building lasting abundance.",
          Gemini: "expands through diverse learning and intellectual exploration. Your growth comes from gathering knowledge, making connections, and sharing ideas.",
          Cancer: "grows through emotional wisdom and nurturing others. Your expansion is intuitive, protective, and focused on creating emotional security.",
          Leo: "expands through creative expression and generous leadership. Your growth comes from inspiring others, artistic pursuits, and confident self-expression.",
          Virgo: "grows through practical service and detailed improvement. Your expansion is methodical, helpful, and focused on making everything better.",
          Libra: "expands through harmony, relationships, and aesthetic beauty. Your growth comes from creating balance, fostering partnerships, and appreciating art.",
          Scorpio: "grows through intense transformation and psychological depth. Your expansion is mysterious, powerful, and focused on uncovering hidden truths.",
          Sagittarius: "expands through philosophical adventure and higher learning. Your growth is optimistic, broad-minded, and constantly seeking meaning.",
          Capricorn: "grows through disciplined achievement and earned respect. Your expansion is structured, ambitious, and focused on building lasting legacy.",
          Aquarius: "expands through innovative rebellion and humanitarian ideals. Your growth is unconventional, progressive, and focused on social change.",
          Pisces: "grows through spiritual compassion and artistic imagination. Your expansion is intuitive, selfless, and connected to universal understanding."
        },
        saturn: {
          Aries: "disciplines through direct action and honest confrontation. Your lessons come from learning patience, strategy, and channeling raw energy constructively.",
          Taurus: "structures through persistent determination and material mastery. Your discipline is steady, practical, and focused on building unshakeable foundations.",
          Gemini: "learns through focused communication and mental discipline. Your lessons come from organizing scattered thoughts and communicating with authority.",
          Cancer: "structures emotions and creates secure boundaries. Your discipline involves learning to protect yourself while still nurturing others effectively.",
          Leo: "disciplines creative expression and ego development. Your lessons come from learning authentic confidence versus seeking external validation.",
          Virgo: "perfects through detailed analysis and practical service. Your discipline is methodical, helpful, and focused on systematic improvement.",
          Libra: "structures relationships and learns balanced decision-making. Your discipline involves creating harmony while maintaining personal boundaries.",
          Scorpio: "masters emotional intensity and transforms through deep work. Your lessons come from learning healthy power dynamics and emotional control.",
          Sagittarius: "disciplines expansive energy and focuses philosophical wisdom. Your lessons involve turning broad ideas into practical, applicable knowledge.",
          Capricorn: "builds authority through traditional hard work and earned respect. Your discipline is natural, ambitious, and focused on long-term achievement.",
          Aquarius: "structures innovation and learns disciplined rebellion. Your lessons come from channeling revolutionary ideas into practical social change.",
          Pisces: "disciplines intuition and structures compassionate service. Your lessons involve learning boundaries while maintaining spiritual connection."
        },
        uranus: {
          Aries: "rebels through direct action and fearless innovation. Your revolution is immediate, pioneering, and breaks new ground through pure force.",
          Taurus: "revolutionizes slowly but creates lasting change. Your innovation challenges traditional values and transforms material security systems.",
          Gemini: "rebels through intellectual innovation and communicative revolution. Your change comes through new ideas, technology, and mental breakthroughs.",
          Cancer: "revolutionizes emotional expression and family structures. Your innovation transforms traditional nurturing and creates new forms of security.",
          Leo: "rebels through creative expression and dramatic individuality. Your revolution is artistic, confident, and transforms entertainment and self-expression.",
          Virgo: "innovates through practical improvement and systematic revolution. Your change is methodical, helpful, and transforms daily life efficiency.",
          Libra: "revolutionizes relationships and social harmony. Your innovation transforms partnerships, art, and creates new forms of balanced cooperation.",
          Scorpio: "rebels through intense transformation and psychological revolution. Your change is deep, mysterious, and transforms power structures completely.",
          Sagittarius: "revolutionizes through philosophical rebellion and expanded consciousness. Your innovation transforms belief systems and higher education.",
          Capricorn: "slowly revolutionizes authority and traditional structures. Your change is strategic, patient, and transforms established institutions from within.",
          Aquarius: "rebels naturally through humanitarian innovation and social revolution. Your change is progressive, detached, and focused on collective evolution.",
          Pisces: "revolutionizes through spiritual innovation and compassionate change. Your rebellion dissolves boundaries and transforms through universal love."
        },
        neptune: {
          Aries: "dreams through direct spiritual action and intuitive leadership. Your imagination is bold, pioneering, and channels divine inspiration into immediate action.",
          Taurus: "dreams through sensual spirituality and grounded mysticism. Your imagination is practical, beautiful, and channels spirit through material form.",
          Gemini: "dreams through intellectual spirituality and communicative mysticism. Your imagination is versatile, curious, and channels spirit through words and ideas.",
          Cancer: "dreams through emotional spirituality and nurturing mysticism. Your imagination is protective, intuitive, and channels spirit through caring for others.",
          Leo: "dreams through creative spirituality and dramatic mysticism. Your imagination is expressive, confident, and channels spirit through artistic performance.",
          Virgo: "dreams through practical spirituality and service mysticism. Your imagination is helpful, detailed, and channels spirit through healing and improvement.",
          Libra: "dreams through harmonious spirituality and aesthetic mysticism. Your imagination is balanced, beautiful, and channels spirit through art and relationships.",
          Scorpio: "dreams through intense spirituality and transformative mysticism. Your imagination is deep, powerful, and channels spirit through death and rebirth.",
          Sagittarius: "dreams through philosophical spirituality and expansive mysticism. Your imagination is optimistic, broad-minded, and channels spirit through wisdom and adventure.",
          Capricorn: "dreams through structured spirituality and disciplined mysticism. Your imagination is practical, ambitious, and channels spirit through traditional forms.",
          Aquarius: "dreams through innovative spirituality and progressive mysticism. Your imagination is detached, humanitarian, and channels spirit through social evolution.",
          Pisces: "dreams through pure spirituality and boundless mysticism. Your imagination is infinite, compassionate, and naturally channels universal consciousness."
        },
        pluto: {
          Aries: "transforms through direct confrontation and fearless regeneration. Your power is immediate, warrior-like, and destroys obstacles through pure force.",
          Taurus: "transforms slowly but completely through material and sensual regeneration. Your power is steady, stubborn, and rebuilds from the ground up.",
          Gemini: "transforms through mental regeneration and communicative power. Your change comes through ideas, words, and intellectual revolution.",
          Cancer: "transforms through emotional regeneration and protective power. Your change is intuitive, nurturing, and destroys to protect what matters most.",
          Leo: "transforms through creative regeneration and expressive power. Your change is dramatic, confident, and rebuilds identity through artistic destruction.",
          Virgo: "transforms through practical regeneration and analytical power. Your change is methodical, helpful, and perfects through detailed destruction and rebuilding.",
          Libra: "transforms through relational regeneration and harmonious power. Your change seeks balance, destroys inequality, and rebuilds through partnership.",
          Scorpio: "transforms through natural regeneration and intense power. Your change is deep, mysterious, and naturally cycles through death and rebirth.",
          Sagittarius: "transforms through philosophical regeneration and expansive power. Your change is optimistic, broad-minded, and rebuilds belief systems completely.",
          Capricorn: "transforms through structural regeneration and authoritative power. Your change is disciplined, patient, and rebuilds institutions from foundations up.",
          Aquarius: "transforms through innovative regeneration and revolutionary power. Your change is progressive, detached, and rebuilds society through radical evolution.",
          Pisces: "transforms through spiritual regeneration and compassionate power. Your change is intuitive, selfless, and rebuilds through universal love and forgiveness."
        }
      };

      return signEffects[planet]?.[sign] || `expresses through ${sign} energy in unique ways.`;
    };

    const planetNames: Record<string, string> = {
      sun: "Your core self",
      moon: "Your emotional nature",
      mercury: "Your mind",
      venus: "Your love style",
      mars: "Your drive",
      jupiter: "Your expansion",
      saturn: "Your discipline",
      uranus: "Your rebellion",
      neptune: "Your dreams",
      pluto: "Your power"
    };

    const planetTitle = planetNames[planetName] || planetName;
    const signEffect = getSignModification(planetName, sign);

    return `${planetTitle} ${signEffect}`;
  };

  if (!isVisible) return null;

  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const dragOffset = isDragging ? Math.max(0, currentX - startX) : 0;

  // Popup mode
  if (mode === 'popup') {
    return (
      <div
        className={`fixed top-[90px] left-1/2 bottom-[150px] z-40 transition-all duration-500 ease-in-out transform -translate-x-1/2 ${className}`}
      >
        <div className="bg-black border border-white/25 rounded-lg h-[600px] w-fit max-w-md min-w-[320px] overflow-hidden shadow-lg flex flex-col">
          {/* Header with X button */}
          <div className="px-4 py-3 border-b border-white/25 flex justify-between items-center flex-shrink-0">
            <h3 className="text-white text-sm font-normal">Your Birth Chart</h3>
            <button
              onClick={handleClose}
              className="text-white/50 hover:text-white transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Birth chart table */}
          <div className="p-4 flex-1 h-full overflow-y-auto min-h-0">
            <BirthChartTable
              planets={planets}
              planetOrder={planetOrder}
              expandedPlanet={expandedPlanet}
              togglePlanetDescription={togglePlanetDescription}
              getPlanetDescription={getPlanetDescription}
            />
          </div>
        </div>
      </div>
    );
  }

  // Drawer mode
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-[90px] right-0 bottom-[150px] w-80 bg-black border-l border-white/35 z-50 h-max transition-transform duration-300 ease-in-out ${isVisible ? 'transform translate-x-0' : 'transform translate-x-full'
          } ${className}`}
        style={{
          transform: `translateX(${dragOffset}px)`,
          borderTopLeftRadius: '0.5rem',
          borderBottomLeftRadius: '0.5rem',
          borderTopRightRadius: '0',
          borderBottomRightRadius: '0'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Header with X button */}
        <div className="px-4 py-2 border-b border-white/25 flex flex-row justify-between items-center">

          <h3 className="text-white text-sm justify-center text-center font-normal">Your Birth Chart</h3>
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>

        </div>

        {/* Birth chart table */}
        <div className="p-4 overflow-y-auto h-full">
          <BirthChartTable
            planets={planets}
            planetOrder={planetOrder}
            expandedPlanet={expandedPlanet}
            togglePlanetDescription={togglePlanetDescription}
            getPlanetDescription={getPlanetDescription}
          />
        </div>
      </div>
    </>
  );
}

// Extracted table component for reuse
function BirthChartTable({
  planets,
  planetOrder,
  expandedPlanet,
  togglePlanetDescription,
  getPlanetDescription
}: {
  planets: any;
  planetOrder: string[];
  expandedPlanet: string | null;
  togglePlanetDescription: (planetName: string) => void;
  getPlanetDescription: (planetName: string, sign: string) => string;
}) {
  return (
    <table className="w-full text-white text-sm table-fixed">
      <thead>
        <tr className="border-b border-white/25">
          <th className="text-left pl-6 py-2 font-normal">Planet</th>
          <th className="text-center py-2 font-normal">Sign</th>
          <th className=" py-2 font-normal text-center">House</th>
          <th className="w-8"></th>
        </tr>
      </thead>
      <tbody>
        {planetOrder.map((planetName) => {
          const planetData = planets[planetName];
          const config = PLANET_CONFIG[planetName];
          if (!planetData || !config) return null;

          const isExpanded = expandedPlanet === planetName;

          return (
            <React.Fragment key={planetName}>
              <tr
                className="border-b border-white/25 last:border-b-0 hover:bg-white/5 cursor-pointer transition-colors text-center"
                onClick={() => togglePlanetDescription(planetName)}
              >
                <td className="py-2 flex items-center pl-4 gap-2">
                  <span className="text-lg text-left">{config.icon}</span>
                  <span className="capitalize text-center">
                    {planetName}
                    {planetData.retrograde && <span className="ml-1 text-center text-white/70 text-xs">R</span>}
                  </span>
                </td>
                <td className="py-2 text-center">{planetData.sign}</td>
                <td className="py-2 text-center">{planetData.house}</td>
                <td className="text-center">
                  <span className={`inline-block transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    ⌄
                  </span>
                </td>
              </tr>
              {isExpanded && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 bg-white/5 border-b border-white/25 text-left">
                    <p className="text-xs text-white/80 leading-relaxed ">
                      {getPlanetDescription(planetName, planetData.sign)}
                    </p>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}