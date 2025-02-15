"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/context/NotificationContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { moderateContent, checkPlagiarism } from '@/lib/moderation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Copy,
  AlertCircle
} from 'lucide-react'

type AutoModerationSettings = {
  enabled: boolean
  maxPlagiarismScore: number
  autoRejectSpam: boolean
  autoRejectHate: boolean
  autoRejectInappropriate: boolean
  autoRejectViolence: boolean
  notifyModerators: boolean
}

export default function AutoModeration() {
  const [settings, setSettings] = useState<AutoModerationSettings>({
    enabled: true,
    maxPlagiarismScore: 0.8,
    autoRejectSpam: true,
    autoRejectHate: true,
    autoRejectInappropriate: true,
    autoRejectViolence: true,
    notifyModerators: true
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const { showNotification } = useNotification()

  const handleSettingChange = (key: keyof AutoModerationSettings, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const processContent = async (blogId: string, content: string) => {
    if (!settings.enabled) return

    setIsProcessing(true)
    try {
      // Check content moderation
      const moderationResult = await moderateContent(content)
      
      // Check plagiarism
      const plagiarismScore = await checkPlagiarism(content)

      let status: 'pending' | 'rejected' = 'pending'
      const reasons: string[] = []

      // Auto-reject conditions
      if (settings.autoRejectSpam && moderationResult.categories.spam) {
        status = 'rejected'
        reasons.push('Spam content detected')
      }
      if (settings.autoRejectHate && moderationResult.categories.hate) {
        status = 'rejected'
        reasons.push('Hate speech detected')
      }
      if (settings.autoRejectInappropriate && moderationResult.categories.inappropriate) {
        status = 'rejected'
        reasons.push('Inappropriate content detected')
      }
      if (settings.autoRejectViolence && moderationResult.categories.violence) {
        status = 'rejected'
        reasons.push('Violent content detected')
      }
      if (plagiarismScore > settings.maxPlagiarismScore) {
        status = 'rejected'
        reasons.push('High plagiarism score')
      }

      // Update blog status
      if (status === 'rejected') {
        await supabase
          .from('blogs')
          .update({ 
            status,
            moderation_notes: reasons.join(', ')
          })
          .eq('id', blogId)

        if (settings.notifyModerators) {
          // Create notification for moderators
          await supabase.from('moderator_notifications').insert({
            blog_id: blogId,
            type: 'auto_rejection',
            message: `Blog automatically rejected. Reasons: ${reasons.join(', ')}`
          })
        }
      }

      return { status, reasons }
    } catch (error) {
      console.error('Auto-moderation error:', error)
      showNotification({
        type: 'error',
        title: 'Moderation Error',
        message: 'Failed to process content automatically'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Content Moderation</CardTitle>
          <CardDescription>
            Configure automatic content moderation settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Auto-Moderation</h4>
                <p className="text-sm text-gray-500">
                  Automatically check new content for violations
                </p>
              </div>
              <Button
                variant={settings.enabled ? "default" : "outline"}
                onClick={() => handleSettingChange('enabled', !settings.enabled)}
              >
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-Reject Spam</h4>
                <p className="text-sm text-gray-500">
                  Automatically reject content detected as spam
                </p>
              </div>
              <Button
                variant={settings.autoRejectSpam ? "default" : "outline"}
                onClick={() => handleSettingChange('autoRejectSpam', !settings.autoRejectSpam)}
              >
                {settings.autoRejectSpam ? <Ban className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-Reject Hate Speech</h4>
                <p className="text-sm text-gray-500">
                  Automatically reject content containing hate speech
                </p>
              </div>
              <Button
                variant={settings.autoRejectHate ? "default" : "outline"}
                onClick={() => handleSettingChange('autoRejectHate', !settings.autoRejectHate)}
              >
                {settings.autoRejectHate ? <Ban className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-Reject Inappropriate Content</h4>
                <p className="text-sm text-gray-500">
                  Automatically reject inappropriate content
                </p>
              </div>
              <Button
                variant={settings.autoRejectInappropriate ? "default" : "outline"}
                onClick={() => handleSettingChange('autoRejectInappropriate', !settings.autoRejectInappropriate)}
              >
                {settings.autoRejectInappropriate ? <Ban className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-Reject Violence</h4>
                <p className="text-sm text-gray-500">
                  Automatically reject violent content
                </p>
              </div>
              <Button
                variant={settings.autoRejectViolence ? "default" : "outline"}
                onClick={() => handleSettingChange('autoRejectViolence', !settings.autoRejectViolence)}
              >
                {settings.autoRejectViolence ? <Ban className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notify Moderators</h4>
                <p className="text-sm text-gray-500">
                  Send notifications for auto-rejected content
                </p>
              </div>
              <Button
                variant={settings.notifyModerators ? "default" : "outline"}
                onClick={() => handleSettingChange('notifyModerators', !settings.notifyModerators)}
              >
                {settings.notifyModerators ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Plagiarism Threshold</h4>
              <input
                type="range"
                aria-label="Plagiarism threshold"
                min="0"
                max="1"
                step="0.1"
                value={settings.maxPlagiarismScore}
                onChange={(e) => handleSettingChange('maxPlagiarismScore', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Lenient</span>
                <span>{settings.maxPlagiarismScore * 100}%</span>
                <span>Strict</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner />
            <p className="mt-2">Processing content...</p>
          </div>
        </div>
      )}
    </div>
  )
} 