import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedWord {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  category: 'Academic' | 'Professional' | 'Literary' | 'Idiomatic';
}

export async function generateNewWord(existingWords: string[]): Promise<GeneratedWord | null> {
  const prompt = `Generate a unique, sophisticated English word for a Nigerian teacher's professional development. 
  The word should be useful in a classroom, academic, or professional setting.
  Avoid these previously generated words: ${existingWords.join(', ')}.
  Provide the result in the following JSON format:
  {
    "word": "The word",
    "phonetic": "The IPA phonetic transcription",
    "definition": "A clear, professional definition",
    "example": "A sentence using the word in a Nigerian educational context (e.g., mentioning schools, students, or the NCE curriculum)",
    "category": "One of: Academic, Professional, Literary, Idiomatic"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            definition: { type: Type.STRING },
            example: { type: Type.STRING },
            category: { 
              type: Type.STRING,
              enum: ['Academic', 'Professional', 'Literary', 'Idiomatic']
            }
          },
          required: ['word', 'phonetic', 'definition', 'example', 'category']
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as GeneratedWord;
  } catch (error) {
    console.error('AI Word Generation Error:', error);
    return null;
  }
}
