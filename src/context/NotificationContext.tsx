"use client"

import React, { createContext, useContext, useState } from 'react'
import { ToastProvider, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast'

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
            variant={notification.type === 'error' ? 'destructive' : 'default'}
          >
            <ToastTitle>{notification.title}</ToastTitle>
            <ToastDescription>{notification.message}</ToastDescription>
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