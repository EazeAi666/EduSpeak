import { GoogleGenAI } from "@google/genai";

// Use process.env (aliased by Vite) or import.meta.env directly for maximum reliability
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined. AI features will be disabled. Please ensure VITE_GEMINI_API_KEY is set in your environment.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const MODELS = {
  TEXT: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  TTS: "gemini-3.1-flash-tts-preview",
};
