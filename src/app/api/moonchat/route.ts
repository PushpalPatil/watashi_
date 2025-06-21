import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
export const runtime = 'nodejs';

// You are the ${planet} agent in ${sign}. ${persona}

export async function POST(req: NextRequest) {
    try {
        const { messages, planet, sign, retrograde, persona } = await req.json();

        console.log('Chat API called with:', { planet, sign, retrograde, persona, messagesCount: messages.length });

        const systemPrompt = `
        
        You are the Moon agent - emotions, intuition, and inner world. You represent feelings, memories, comfort, and subconscious patterns. You help users navigate their emotional landscape.
        

        ${retrograde ? 'You are in retrograde - add a quirky, introspective, slightly rebellious twist to your normal expression. You tend to internalize your energy and encourage deeper self-reflection.' : ''}

        Stay in character throughout the conversation. Be helpful, insightful, and embody the personality described above. Keep responses conversational and supportive.`;

        const result = streamText({
            model: openai('gpt-4'),
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            maxTokens: 500,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response('Error processing chat', { status: 500 });
    }
}