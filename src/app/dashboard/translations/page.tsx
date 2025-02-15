"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { LoadingPage } from '@/components/ui/loading'

type Translation = {
  id: string
  blog_id: string
  language: string
  translated_title: string
  accuracy_score: number
  created_at: string
}

export default function TranslationsPage() {
  const { user } = useKindeAuth()
  const [translations, setTranslations] = useState<Translation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTranslations() {
      if (!user?.id) return
      const { data } = await supabase
        .from('translations')
        .select(`
          *,
          blogs!inner(title, user_id)
        `)
        .eq('blogs.user_id', user.id)
        .order('created_at', { ascending: false })
      
      setTranslations(data || [])
      setIsLoading(false)
    }

    fetchTranslations()
  }, [user])

  if (isLoading) return <LoadingPage />

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Translations</h1>

      <div className="grid gap-4">
        {translations.map((translation) => (
          <Card key={translation.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{translation.translated_title}</h3>
                  <p className="text-sm text-gray-500">
                    Language: {translation.language}
                  </p>
                </div>
                <div className="text-sm">
                  Accuracy: {Math.round(translation.accuracy_score * 100)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 