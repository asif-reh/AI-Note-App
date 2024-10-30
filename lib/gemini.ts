import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export interface GeneratedNote {
  title: string;
  content: string;
  progress: number;
}

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiError';
  }
}

export async function generateWithGemini(prompt: string): Promise<string> {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new GeminiError("Gemini API key is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
      throw new GeminiError(`AI Generation failed: ${error.message}`);
    }
    throw new GeminiError("An unexpected error occurred during AI generation");
  }
}

export async function chatWithNotes(notes: any[], userQuery: string): Promise<string> {
  if (!userQuery.trim()) {
    throw new GeminiError("Query cannot be empty");
  }

  if (!notes.length) {
    throw new GeminiError("No notes available for context");
  }

  const notesContext = notes
    .map((note) => `Title: ${note.title}\nContent: ${note.content}\nProgress: ${note.progress}%`)
    .join("\n\n");

  const prompt = `
    Context - These are my notes:
    ${notesContext}

    User Query: ${userQuery}

    Please provide a helpful response based on the notes and query above.
  `;

  return generateWithGemini(prompt);
}

export async function generateNote(topic: string): Promise<GeneratedNote> {
  if (!topic.trim()) {
    throw new GeminiError("Topic cannot be empty");
  }

  const prompt = `
    Generate a detailed note about "${topic}".
    
    Respond with ONLY a JSON object in this EXACT format (no other text):
    {
      "title": "Brief, clear title",
      "content": "Detailed, well-structured content",
      "progress": 50
    }

    Requirements:
    - Title: Clear and concise
    - Content: Informative but concise, well-structured
    - Progress: Number between 0-100 indicating completeness
  `;

  try {
    const response = await generateWithGemini(prompt);
    console.log("Raw AI response:", response); // For debugging

    let jsonStr = response.trim();
    // Try to extract JSON if wrapped in other text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(jsonStr) as GeneratedNote;
      
      // Validate the response structure
      if (!parsed.title || typeof parsed.title !== 'string') {
        throw new GeminiError("Invalid or missing title in AI response");
      }
      if (!parsed.content || typeof parsed.content !== 'string') {
        throw new GeminiError("Invalid or missing content in AI response");
      }
      if (typeof parsed.progress !== 'number' || parsed.progress < 0 || parsed.progress > 100) {
        throw new GeminiError("Invalid progress value in AI response");
      }

      return {
        title: parsed.title.trim(),
        content: parsed.content.trim(),
        progress: Math.round(parsed.progress)
      };
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Attempted to parse:", jsonStr);
      throw new GeminiError("Failed to parse AI response as valid JSON");
    }
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error;
    }
    console.error("Note generation error:", error);
    throw new GeminiError("Failed to generate note. Please try again.");
  }
}