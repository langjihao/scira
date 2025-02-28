import { xai } from '@ai-sdk/xai';
import { streamText } from 'ai';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

interface RequestBody {
  messages: ChatMessage[];
  fileId?: string;
}

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { messages, fileId } : RequestBody = await req.json();

    let context = '';
    
    if (fileId) {
      const filePath = join(process.cwd(), 'uploads', fileId);
      
      if (!existsSync(filePath)) {
        return new Response(
          JSON.stringify({ error: 'PDF file not found' }), 
          { status: 404 }
        );
      }

      try {
        const loader = new PDFLoader(filePath, {
          splitPages: false
        });
        const docs = await loader.load();
        context = docs.map((doc: any) => doc.pageContent).join('\n');
      } catch (error) {
        console.error('PDF processing error:', error);
        return new Response(
          JSON.stringify({ error: 'Error processing PDF file' }), 
          { status: 500 }
        );
      }
    }

    const systemPrompt = `你是一个助手,可以帮助回答关于上传PDF文档的问题。
${context ? `以下是PDF文档的内容:\n\n${context}\n` : ''}
请基于以上内容回答用户的问题。如果问题超出文档范围,请告知用户。`;

    const result = streamText({
      model: xai('grok-2-1212'),
      system: systemPrompt,
      messages,
    });
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}