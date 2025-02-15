"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Button } from '@/components/ui/button'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { supabase } from '@/lib/supabase'

export default function NewBlog() {
  const router = useRouter()
  const { user } = useKindeAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      // Create blog post
      const { data: blog, error: blogError } = await supabase
        .from('blogs')
        .insert({
          user_id: user.id,
          title,
          content,
          original_language: 'en',
          status: 'draft'
        })
        .select()
        .single()

      if (blogError) throw blogError

      // Handle file upload if exists
      if (file) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${user.id}/${blog.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('blog-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError
      }

      router.push(`/dashboard/edit/${blog.id}`)
    } catch (error) {
      console.error('Error creating blog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MaxWidthWrapper className="mb-8 mt-24">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Create New Blog</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            aria-label="Blog title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            aria-label="Blog content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Video/Audio (optional)
          </label>
          <input
            type="file"
            aria-label="Upload media file"
            accept="video/*,audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Blog'}
          </Button>
        </div>
      </form>
    </MaxWidthWrapper>
  )
} 