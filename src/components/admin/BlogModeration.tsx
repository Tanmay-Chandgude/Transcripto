"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/context/NotificationContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { moderateContent, checkPlagiarism } from '@/lib/moderation'

type Blog = {
  id: string
  title: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  author_email: string
  created_at: string
}

export default function BlogModeration() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showNotification } = useNotification()
  const [autoModerationEnabled, setAutoModerationEnabled] = useState(true)

  useEffect(() => {
    fetchPendingBlogs()
  }, [])

  const fetchPendingBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          content,
          status,
          created_at,
          profiles (email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      setBlogs(data.map(blog => ({
        ...blog,
        created_at: blog.created_at || new Date().toISOString(),
        author_email: blog.profiles[0]?.email
      })))
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch pending blogs'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeration = async (blogId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved' && autoModerationEnabled) {
        const blog = blogs.find(b => b.id === blogId)
        if (!blog) return

        // Run automated checks before approval
        const moderationResult = await moderateContent(blog.content)
        const plagiarismScore = await checkPlagiarism(blog.content)

        if (moderationResult.flagged || plagiarismScore > 0.8) {
          showNotification({
            type: 'error',
            title: 'Moderation Alert',
            message: 'Content flagged by automated checks. Please review.'
          })
          return
        }
      }

      const { error } = await supabase
        .from('blogs')
        .update({ status })
        .eq('id', blogId)

      if (error) throw error

      setBlogs(blogs.filter(blog => blog.id !== blogId))
      
      showNotification({
        type: 'success',
        title: 'Blog Updated',
        message: `Blog has been ${status}`
      })
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update blog status'
      })
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pending Blogs</h2>
        <Button
          variant="outline"
          onClick={() => setAutoModerationEnabled(!autoModerationEnabled)}
        >
          Auto-Moderation: {autoModerationEnabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
      {blogs.length === 0 ? (
        <p className="text-gray-500">No pending blogs to moderate</p>
      ) : (
        <div className="grid gap-6">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{blog.title}</h3>
                  <p className="text-sm text-gray-500">
                    By {blog.author_email} on {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleModeration(blog.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleModeration(blog.id, 'approved')}
                  >
                    Approve
                  </Button>
                </div>
              </div>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 