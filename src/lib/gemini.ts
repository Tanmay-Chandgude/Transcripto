import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function analyzeContentWithGemini(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Analyze the following content for moderation. Check for:
      1. Spam content
      2. Hate speech
      3. Inappropriate content
      4. Violence
      
      Respond in JSON format with the following structure:
      {
        "flagged": boolean,
        "categories": {
          "spam": boolean,
          "hate": boolean,
          "inappropriate": boolean,
          "violence": boolean
        },
        "reasons": string[],
        "confidence": number
      }

      Content to analyze:
      ${content}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    const analysis = JSON.parse(text);
    
    return analysis;
  } catch (error) {
    console.error('Gemini analysis error:', error);
    throw error;
  }
} 