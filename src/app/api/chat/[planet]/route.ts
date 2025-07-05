// /api/chat/[planet]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getPlanetConfig } from '@/lib/planet-config';

export const runtime = 'edge';

const OPENAI_API_KEY = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(
      req: NextRequest,
      { params }: { params: { planet: string } }
) {
      try {
            const { planet } = params;
            const { messages, sign, house, retrograde } = await req.json();

            console.log('API Route - Planet:', planet);
            console.log('API Route - Data:', { sign, house, retrograde });

            // Get planet configuration
            const planetConfig = getPlanetConfig(planet);

            if (!planetConfig) {
                  return NextResponse.json(
                        { error: `Planet "${planet}" is not supported` },
                        { status: 400 }
                  );
            }

            // Build dynamic personality prompt
            const personalityPrompt = planetConfig.personalityBuilder(
                  sign || 'Unknown',
                  house || 0,
                  retrograde || false
            );

            // Create system message with dynamic personality
            const systemMessage = `${personalityPrompt}

IMPORTANT RULES:
- Always stay in character as this specific planet in this specific sign and house
- Use first person (I, me, my, mine) exclusively
- Be conversational, warm, and engaging - not clinical or list-like
- Embody the personality traits naturally in your communication style
- Keep responses between 2-4 paragraphs unless asked for more detail
- Use relevant emojis occasionally but don't overdo it
- Be supportive and insightful about the user's astrological nature
- Reference your sign and house placement when relevant to the conversation
- If retrograde, incorporate that energy into your responses naturally

Remember: You ARE this planetary energy - embody it, don't just describe it.`;

            console.log('Generated personality prompt:', personalityPrompt);

            // Use Vercel AI SDK for streaming
            const result = await streamText({
                  model: openai('gpt-4'),
                  messages: [
                        { role: 'system', content: systemMessage },
                        ...(messages || [])
                  ],
                  maxTokens: 500,
                  temperature: 0.7,
            });

            return result.toDataStreamResponse();

      } catch (error) {
            console.error('Dynamic Planet API Error:', error);
            return NextResponse.json(
                  { error: (error as Error).message || 'Chat error' },
                  { status: 500 }
            );
      }
}