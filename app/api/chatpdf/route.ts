import { xai } from '@ai-sdk/xai';
import { streamText, UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } : { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: xai('grok-2-1212'),
    system: 'You are a helpful assistant.',
    messages,
  });
  return result.toDataStreamResponse();
}