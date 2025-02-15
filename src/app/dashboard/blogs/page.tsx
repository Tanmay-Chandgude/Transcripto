"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { LoadingPage } from '@/components/ui/loading'

type Blog = {
  id: string
  title: string
  content: string
  status: 'draft' | 'published'
  created_at: string
}

export default function BlogsPage() {
  const { user } = useKindeAuth()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogs() {
      if (!user?.id) return
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setBlogs(data || [])
      setIsLoading(false)
    }

    fetchBlogs()
  }, [user])

  if (isLoading) return <LoadingPage />

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Blogs</h1>
        <Button>Create New Blog</Button>
      </div>

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
    </div>
  )
} 