"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'
import { useNotification } from '@/context/NotificationContext'
import { useRouter } from 'next/navigation'
import { Calendar, Globe } from 'lucide-react'

type Blog = {
  id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
  description?: string
  original_language: string
}

export default function BlogsPage() {
  const router = useRouter()
  const { user } = useKindeAuth()
  const { showNotification } = useNotification()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogs() {
      if (!user?.id) return
      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        console.log('Fetched blogs:', data)
        setBlogs(data || [])
      } catch (error) {
        console.error('Error fetching blogs:', error)
        showNotification({
          title: 'Error',
          message: 'Failed to fetch blogs',
          type: 'error'
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogs()
  }, [user])

  const handleBlogClick = (blogId: string) => {
    router.push(`/dashboard/blogs/${blogId}`)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Blogs</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner size="lg" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No blogs yet. Start by translating or transcribing content!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card 
              key={blog.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleBlogClick(blog.id)}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
                {blog.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {blog.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {blog.original_language.toUpperCase()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 