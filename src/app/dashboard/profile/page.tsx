"use client"

import { useState } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/context/NotificationContext'
import Image from 'next/image'

export default function ProfilePage() {
  const { user } = useKindeAuth()
  const { showNotification } = useNotification()
  const [uploading, setUploading] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setAvatar(publicUrl)
      showNotification({
        title: 'Success',
        message: 'Profile photo updated successfully',
        type: 'success'
      })
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to update profile photo',
        type: 'error'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                  {user?.given_name?.[0] || 'U'}
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input value={user?.given_name || ''} disabled />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input value={user?.email || ''} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Current Plan: Free</h3>
                <p className="text-sm text-gray-500">Basic features included</p>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 