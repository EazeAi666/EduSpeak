import { Type } from "@google/genai";
import { ai, MODELS } from "../lib/gemini";

export interface GeneratedWord {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms?: string[];
  category: 'Academic' | 'Professional' | 'Literary' | 'Idiomatic' | 'Figure of Speech';
}

export async function generateNewWords(existingWords: string[], count: number = 1): Promise<GeneratedWord[]> {
  const prompt = `Generate ${count} unique, sophisticated English word(s) or common figures of speech for a Nigerian teacher's professional development. 
  The selection should be highly relevant for classroom teaching, academic writing, or professional education (NCE levels).
  
  For each entry, provide synonyms that a teacher could use to explain the word to students.
  
  Avoid these previously discussed words: ${existingWords.join(', ')}.
  
  Provide the result as a JSON array of objects:
  [
    {
      "word": "The word or figure of speech",
      "phonetic": "The IPA phonetic transcription",
      "definition": "A clear, professional definition suitable for a teacher",
      "example": "A sentence using it in a Nigerian educational or school setting",
      "synonyms": ["synonym 1", "synonym 2"],
      "antonyms": ["antonym 1", "antonym 2"],
      "category": "One of: Academic, Professional, Literary, Idiomatic, Figure of Speech"
    }
  ]`;

  try {
    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              category: { 
                type: Type.STRING,
                enum: ['Academic', 'Professional', 'Literary', 'Idiomatic', 'Figure of Speech']
              }
            },
            required: ['word', 'phonetic', 'definition', 'example', 'synonyms', 'antonyms', 'category']
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from AI");
    
    // Fallback: strip markdown code blocks if the model included them
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    console.error('AI Word Generation Error:', error);
    return [];
  }
}
