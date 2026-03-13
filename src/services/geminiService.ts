import { GoogleGenAI } from "@google/genai";

/**
 * Gemini AI Service
 * Uses the @google/genai SDK to interact with Gemini models.
 */

// Initialize the Gemini AI client
// The API key is automatically provided by the platform environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates a response from Gemini based on the user prompt.
 * @param userPrompt - The text input from the user
 * @returns The generated text response or an error message
 */
export const getGeminiResponse = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userPrompt,
      config: {
        systemInstruction: "You are a helpful assistant for the West Gojjam Zone Police Department. Respond in Amharic or English as requested by the user. Be professional and concise.",
      }
    });

    // Access the .text property directly (not a method)
    return response.text || "ምንም ምላሽ አልተገኘም። (No response found.)";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "ይቅርታ፣ ምላሽ መስጠት አልቻልኩም። (Sorry, I couldn't generate a response.)";
  }
};
