import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { content, targetLanguage } = await req.json()

    if (!content || !targetLanguage) {
      return NextResponse.json(
        { error: 'Content and target language are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const prompt = `Translate this text to ${targetLanguage}:\n\n${content}\n\nTranslated text:`
    const result = await model.generateContent(prompt)
    const translation = result.response.text()

    return NextResponse.json({ translation })
  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to translate content' },
      { status: 500 }
    )
  }
} 