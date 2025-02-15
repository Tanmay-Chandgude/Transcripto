"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { supabase } from '@/lib/supabase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type AnalyticsData = {
  date: string
  views: number
  translations: number
}

export default function Analytics() {
  const { user } = useKindeAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [totalViews, setTotalViews] = useState(0)
  const [totalTranslations, setTotalTranslations] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics()
    }
  }, [user])

  const fetchAnalytics = async () => {
    // Fetch blog views
    const { data: views } = await supabase
      .from('blogs')
      .select('created_at')
      .eq('user_id', user?.id)

    // Fetch translations
    const { data: translations } = await supabase
      .from('translations')
      .select('created_at, blog_id')
      .eq('user_id', user?.id)

    // Process data for chart
    const processedData = processAnalyticsData(views || [], translations || [])
    setAnalyticsData(processedData)
    setTotalViews(views?.length || 0)
    setTotalTranslations(translations?.length || 0)
  }

  const processAnalyticsData = (views: any[], translations: any[]): AnalyticsData[] => {
    // Process and combine views and translations data by date
    // This is a simplified example
    return views.map((view) => ({
      date: new Date(view.created_at).toLocaleDateString(),
      views: 1,
      translations: translations.filter(
        (t) => new Date(t.created_at).toLocaleDateString() === new Date(view.created_at).toLocaleDateString()
      ).length,
    }))
  }

  return (
    <MaxWidthWrapper className="mb-8 mt-24">
      <h1 className="text-4xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Views</h3>
          <p className="text-3xl font-bold">{totalViews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total Translations</h3>
          <p className="text-3xl font-bold">{totalTranslations}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Engagement Rate</h3>
          <p className="text-3xl font-bold">
            {totalViews > 0 ? ((totalTranslations / totalViews) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Performance Over Time</h2>
        <div className="w-full h-[400px]">
          <LineChart
            width={800}
            height={400}
            data={analyticsData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8884d8" />
            <Line type="monotone" dataKey="translations" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
    </MaxWidthWrapper>
  )
} 