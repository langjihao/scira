'use client';

import { useChat } from '@ai-sdk/react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { cn } from '@/lib/utils';

export default function Page() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: '/api/chatpdf'
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    
    append({ 
      content: input, 
      role: 'user' 
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 h-[calc(100vh-4rem)]">
      <Card className="h-full flex flex-col">
        {/* 消息列表区域 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.role === 'user'
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="输入你的问题..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}