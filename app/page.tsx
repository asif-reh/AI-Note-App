"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIChat } from "@/components/ai-chat";
import { NoteGenerator } from "@/components/note-generator";
import { Note } from "@/lib/types";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newProgress, setNewProgress] = useState(0);

  const addNote = () => {
    if (newTitle.trim() && newContent.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newTitle,
        content: newContent,
        progress: newProgress,
      };
      setNotes([...notes, note]);
      setNewTitle("");
      setNewContent("");
      setNewProgress(0);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const updateProgress = (id: string, newValue: number) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, progress: newValue } : note
      )
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-4xl font-bold text-foreground">Progress Notes</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-5 w-5" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Note Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Note Content"
                    className="min-h-[100px]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                      Initial Progress: {newProgress}%
                    </label>
                    <Slider
                      value={[newProgress]}
                      onValueChange={(value) => setNewProgress(value[0])}
                      max={100}
                      step={1}
                    />
                  </div>
                  <Button onClick={addNote} className="w-full">
                    Create Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-6">
          <NoteGenerator onNoteGenerated={(note) => setNotes([...notes, note])} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="p-6 space-y-4 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold line-clamp-2">
                    {note.title}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNote(note.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-muted-foreground line-clamp-3">
                  {note.content}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{note.progress}%</span>
                  </div>
                  <Progress value={note.progress} className="h-2" />
                  <Slider
                    value={[note.progress]}
                    onValueChange={(value) => updateProgress(note.id, value[0])}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </Card>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No notes yet. Click the &quot;Add Note&quot; button to create one!
              </p>
            </div>
          )}
        </div>

        <AIChat notes={notes} />
      </div>
    </main>
  );
}