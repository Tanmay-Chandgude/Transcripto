"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNotification } from '@/context/NotificationContext'
import type { Blog } from '@/types/supabase'

export default function BlogPage() {
  const params = useParams()
  const router = useRouter()
  const { showNotification } = useNotification()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBlog() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setBlog(data)
      } catch (error) {
        console.error('Error:', error)
        showNotification({
          title: 'Error',
          message: 'Failed to fetch blog',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!blog) {
    return <div>Blog not found</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Blogs
      </Button>

      <article className="prose lg:prose-xl">
        <h1>{blog.title}</h1>
        {blog.description && (
          <p className="text-gray-500 text-lg">{blog.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
          <span>Language: {blog.original_language.toUpperCase()}</span>
        </div>
        <div className="whitespace-pre-wrap">{blog.content}</div>
      </article>
    </div>
  )
} 