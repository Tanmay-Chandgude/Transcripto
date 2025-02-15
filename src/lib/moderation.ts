import { supabase } from './supabase'
import { analyzeContentWithGemini } from './gemini'
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

type ModerationResult = {
  flagged: boolean
  categories: {
    hate: boolean
    spam: boolean
    inappropriate: boolean
    violence: boolean
  }
  score: number
  reasons: string[]
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const analysis = await analyzeContentWithGemini(content)

    return {
      flagged: analysis.flagged,
      categories: analysis.categories,
      score: analysis.confidence,
      reasons: analysis.reasons
    }
  } catch (error) {
    console.error('Moderation error:', error)
    throw error
  }
}

export async function checkPlagiarism(content: string): Promise<number> {
  try {
    const { data: blogs } = await supabase
      .from('blogs')
      .select('content')
      .neq('status', 'rejected')

    if (!blogs) return 0

    // Use Gemini to check for plagiarism
    const prompt = `
      Compare the following text with these existing texts and calculate a similarity score between 0 and 1.
      Consider semantic similarity, not just exact matches.
      Return only the number representing the highest similarity score.

      New text:
      ${content}

      Existing texts:
      ${blogs.map(blog => blog.content).join('\n---\n')}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const similarityScore = parseFloat(result.response.text());

    return isNaN(similarityScore) ? 0 : similarityScore;
  } catch (error) {
    console.error('Plagiarism check error:', error)
    throw error
  }
}

function calculateSimilarity(text1: string, text2: string): number {
  // Simple Jaccard similarity implementation
  const set1 = new Set(text1.toLowerCase().split(/\s+/))
  const set2 = new Set(text2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...set1].filter(x => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  return intersection.size / union.size
} 