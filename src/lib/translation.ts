import { supabase } from './supabase'

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY!
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2'

export async function translateContent(text: string, targetLanguage: string) {
  try {
    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    })

    const data = await response.json()
    return data.data.translations[0].translatedText
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

export async function createTranslation(blogId: string, language: string, title: string, content: string) {
  try {
    const translatedTitle = await translateContent(title, language)
    const translatedContent = await translateContent(content, language)

    const { data, error } = await supabase
      .from('translations')
      .insert({
        blog_id: blogId,
        language,
        translated_title: translatedTitle,
        translated_content: translatedContent,
        accuracy_score: 0.85 // This would ideally come from the translation API
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating translation:', error)
    throw error
  }
} 