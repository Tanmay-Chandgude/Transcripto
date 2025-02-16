"use client"

import React, { createContext, useContext, useState } from 'react'
import { ToastProvider, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'
import { CheckCircle, AlertCircle } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'info'

type Notification = {
  type: NotificationType
  title: string
  message: string
}

type NotificationContextType = {
  showNotification: (notification: Notification) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [open, setOpen] = useState(false)

  const showNotification = (newNotification: Notification) => {
    setNotification(newNotification)
    setOpen(true)
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <ToastProvider>
        {notification && (
          <Toast
            open={open}
            onOpenChange={setOpen}
            className={`${
              notification.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            } p-4`}
          >
            <div className="flex items-start">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="ml-3">
                <ToastTitle className={`font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </ToastTitle>
                <ToastDescription className={`mt-1 ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </ToastDescription>
              </div>
            </div>
          </Toast>
        )}
        {children}
      </ToastProvider>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
} 