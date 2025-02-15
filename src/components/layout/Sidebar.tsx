"use client"

import { useState, useEffect } from 'react'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components'
import { 
  FileText, 
  Globe, 
  LogOut, 
  Menu,
  ArrowLeft,
  Video,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const sidebarItems = [
  {
    title: 'Transcribe & Translate',
    icon: Video,
    href: '/dashboard',
  },
  {
    title: 'My Blogs',
    icon: FileText,
    href: '/dashboard/blogs',
  },
  {
    title: 'Translation History',
    icon: Globe,
    href: '/dashboard/translations',
  },
  {
    title: 'Profile',
    icon: User,
    href: '/dashboard/profile',
  }
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useKindeAuth()
  const [userImage, setUserImage] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    if (user?.given_name) {
      setUserName(user.given_name)
    }
    if (user?.id) {
      fetchUserAvatar()
    }
  }, [user])

  const fetchUserAvatar = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single()

      if (profile?.avatar_url) {
        setUserImage(profile.avatar_url)
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
    }
  }

  return (
    <>
      {/* Hamburger Menu Button - Visible when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="sticky top-0 flex h-14 items-center justify-between border-b px-4 bg-white">
          <div className="flex items-center gap-2">
            {userImage ? (
              <Image
                src={userImage}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {userName?.[0] || 'U'}
              </div>
            )}
            <span className="font-semibold">{userName || 'User'}</span>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Close menu"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <LogoutLink 
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </LogoutLink>
        </div>
      </aside>
    </>
  )
} 