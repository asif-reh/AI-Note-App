"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { generateNote, GeminiError } from "@/lib/gemini";
import { Note } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

interface NoteGeneratorProps {
  onNoteGenerated: (note: Note) => void;
}

export function NoteGenerator({ onNoteGenerated }: NoteGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      toast({
        title: "Configuration Error",
        description: "Gemini API key is not configured. Please add it to your environment variables.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedNote = await generateNote(topic);
      const newNote: Note = {
        id: Date.now().toString(),
        title: generatedNote.title,
        content: generatedNote.content,
        progress: generatedNote.progress
      };
      
      onNoteGenerated(newNote);
      setTopic("");
      toast({
        title: "Success",
        description: "Note generated successfully!",
      });
    } catch (error) {
      console.error("Note generation error:", error);
      const message = error instanceof GeminiError 
        ? error.message 
        : "Failed to generate note. Please try again.";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter a topic to generate a note..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
          disabled={isGenerating}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Note
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}