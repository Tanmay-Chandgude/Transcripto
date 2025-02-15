"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { LoadingSpinner } from '@/components/ui/loading'

type EngagementData = {
  blogId: string
  title: string
  views: number
  translations: number
  averageReadTime: number
}

export default function EngagementMetrics() {
  const [data, setData] = useState<EngagementData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEngagementData()
  }, [])

  const fetchEngagementData = async () => {
    try {
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select(`
          id,
          title,
          views,
          translations (count),
          read_time_stats (
            average_time
          )
        `)
        .order('views', { ascending: false })
        .limit(10)

      if (error) throw error

      const formattedData = blogs.map(blog => ({
        blogId: blog.id,
        title: blog.title,
        views: blog.views || 0,
        translations: blog.translations?.length || 0,
        averageReadTime: blog.read_time_stats?.[0]?.average_time || 0
      }))

      setData(formattedData)
    } catch (error) {
      console.error('Error fetching engagement data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Top Performing Blogs</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#8884d8" name="Views" />
            <Bar dataKey="translations" fill="#82ca9d" name="Translations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Average Read Time</h3>
          <div className="space-y-4">
            {data.map(blog => (
              <div key={blog.blogId} className="flex justify-between items-center">
                <span className="truncate">{blog.title}</span>
                <span className="font-semibold">
                  {Math.round(blog.averageReadTime)}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Translation Rate</h3>
          <div className="space-y-4">
            {data.map(blog => (
              <div key={blog.blogId} className="flex justify-between items-center">
                <span className="truncate">{blog.title}</span>
                <span className="font-semibold">
                  {((blog.translations / blog.views) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 