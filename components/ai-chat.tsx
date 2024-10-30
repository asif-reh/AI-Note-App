"use client";

import { useState } from "react";
import { MessageSquare, Loader2, X, MinimizeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { chatWithNotes, GeminiError } from "@/lib/gemini";
import { Note } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface AIChatProps {
  notes: Note[];
}

export function AIChat({ notes }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChat = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      toast({
        title: "Configuration Error",
        description: "Gemini API key is not configured",
        variant: "destructive",
      });
      return;
    }

    if (notes.length === 0) {
      toast({
        title: "Error",
        description: "Please add some notes before chatting",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await chatWithNotes(notes, query);
      setResponse(result);
    } catch (error) {
      const message = error instanceof GeminiError 
        ? error.message 
        : "Failed to get AI response. Please try again.";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      ) : (
        <Card className={cn(
          "w-[380px] shadow-lg transition-all duration-300",
          "animate-in slide-in-from-bottom-5"
        )}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h2 className="font-semibold">AI Chat Assistant</h2>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsOpen(false);
                  setResponse("");
                  setQuery("");
                }}
              >
                <MinimizeIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsOpen(false);
                  setResponse("");
                  setQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <ScrollArea className={cn(
              "rounded-md border",
              response ? "h-[300px]" : "h-[100px]"
            )}>
              {response ? (
                <div className="p-4 space-y-4">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-medium text-sm">You asked:</p>
                    <p className="text-muted-foreground">{query}</p>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3">
                    <p className="font-medium text-sm">AI Assistant:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{response}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Ask me anything about your notes!
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Ask about your notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleChat()}
                disabled={isLoading}
              />
              <Button onClick={handleChat} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ask"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}