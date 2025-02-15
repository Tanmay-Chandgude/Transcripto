"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { supabase } from '@/lib/supabase'
import { LoadingPage } from '@/components/ui/loading'
import { useNotification } from '@/context/NotificationContext'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import EngagementMetrics from '@/components/analytics/EngagementMetrics'
import UserManagement from '@/components/admin/UserManagement'
import BlogModeration from '@/components/admin/BlogModeration'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AutoModeration from '@/components/admin/AutoModeration'

type AdminStats = {
  totalUsers: number
  totalBlogs: number
  totalTranslations: number
  revenue: number
}

type UserData = {
  id: string
  email: string
  subscription_tier: string
  subscription_status: string
  created_at: string
}

export default function AdminDashboard() {
  const { user } = useKindeAuth()
  const { showNotification } = useNotification()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      checkAdminAccess()
      fetchAdminData()
    }
  }, [user])

  const checkAdminAccess = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profile?.role !== 'admin') {
      showNotification({
        type: 'error',
        title: 'Access Denied',
        message: 'You do not have permission to access this page.'
      })
      // Redirect to dashboard
      window.location.href = '/dashboard'
    }
  }

  const fetchAdminData = async () => {
    try {
      // Fetch stats
      const { data: statsData } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')

      const stats: AdminStats = {
        totalUsers: statsData?.length || 0,
        totalBlogs: 0,
        totalTranslations: 0,
        revenue: 0
      }

      // Fetch users
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, email, subscription_tier, subscription_status, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error

      setStats(stats)
      setUsers(userData)
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch admin data'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingPage />

  return (
    <MaxWidthWrapper className="mb-8 mt-24">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="auto-moderation">Auto-Moderation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{stats?.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Total Blogs</h3>
              <p className="text-3xl font-bold">{stats?.totalBlogs}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Total Translations</h3>
              <p className="text-3xl font-bold">{stats?.totalTranslations}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold">${stats?.revenue}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.subscription_tier}</TableCell>
                    <TableCell>{user.subscription_status}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <EngagementMetrics />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="moderation">
          <BlogModeration />
        </TabsContent>

        <TabsContent value="auto-moderation">
          <AutoModeration />
        </TabsContent>
      </Tabs>
    </MaxWidthWrapper>
  )
} 