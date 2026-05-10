import { GoogleGenAI } from "@google/genai";

// Standard way to access env in Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');

export const hasApiKey = !!apiKey;
export const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const MODELS = {
  TEXT: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  TTS: "gemini-3.1-flash-tts-preview",
};
