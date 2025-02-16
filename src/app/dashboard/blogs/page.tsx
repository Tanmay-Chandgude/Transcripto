"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'
import { useNotification } from '@/context/NotificationContext'

type Blog = {
  id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
}

export default function BlogsPage() {
  const { user } = useKindeAuth()
  const { showNotification } = useNotification()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
        
        if (error) {
          console.error('Error fetching blogs:', error)
          showNotification({
            title: 'Error',
            message: 'Failed to fetch blogs',
            type: 'error'
          })
          return
        }
        
        setBlogs(data || [])
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogs()
  }, [user, refreshTrigger])

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Blogs</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner size="lg" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No blogs yet. Start by translating or transcribing content!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{blog.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    blog.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {blog.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 