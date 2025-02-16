import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAX_FILE_SIZE = {
  free: 10 * 1024 * 1024,    // 10MB
  pro: 25 * 1024 * 1024,     // 25MB
  enterprise: 25 * 1024 * 1024 // 25MB
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('file') as File
    const userId = formData.get('userId') as string

    // Get user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const tier = profile?.subscription_tier || 'free'
    const maxSize = MAX_FILE_SIZE[tier as keyof typeof MAX_FILE_SIZE]

    if (audioFile.size > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds limit (${maxSize / (1024 * 1024)}MB) for your subscription tier` 
      }, { status: 400 })
    }

    const openAIFormData = new FormData()
    openAIFormData.append('file', audioFile)
    openAIFormData.append('model', 'whisper-1')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: openAIFormData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Transcription failed')
    }

    const result = await response.json()
    return NextResponse.json({ transcription: result.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}

// Increase the maximum request size
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '25mb'
  }
} 