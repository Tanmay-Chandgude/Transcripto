"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/context/NotificationContext'
import { LoadingSpinner } from './ui/loading'

interface SaveBlogDialogProps {
  isOpen: boolean
  onClose: () => void
  content: string
  language: string
  onSave?: () => void
}

export function SaveBlogDialog({ isOpen, onClose, content, language, onSave }: SaveBlogDialogProps) {
  const { user } = useKindeAuth()
  const { showNotification } = useNotification()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('Current state:', { user, title, content, language });

    if (!user?.id || !title.trim()) {
      console.log('Validation failed:', { userId: user?.id, title });
      showNotification({
        title: '❌ Error',
        message: 'Please enter a title',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    try {
      if (!content) {
        console.log('No content found');
        throw new Error('No content to save');
      }

      console.log('Attempting Supabase insert with:', {
        user_id: user.id,
        title: title.trim(),
        content_length: content.length,
        language
      });

      const { error, data } = await supabase.from('blogs').insert({
        user_id: user.id,
        title: title.trim(),
        content: content,
        description: description.trim() || null,
        original_language: language,
        status: 'published'
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Blog saved successfully:', data);
      
      showNotification({
        title: '✨ Success!',
        message: 'Blog saved successfully',
        type: 'success'
      });

      onSave?.();
      onClose();

    } catch (error) {
      console.error('Save error:', error);
      showNotification({
        title: '❌ Error',
        message: 'Failed to save blog',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDescription('')
    }
  }, [isOpen])

  const SaveButton = () => (
    <Button 
      onClick={() => {
        console.log('Save button clicked');
        handleSave();
      }}
      disabled={!title.trim() || isSaving}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
    >
      {isSaving ? (
        <div className="flex items-center">
          <LoadingSpinner size="sm" />
          <span className="ml-2">Saving...</span>
        </div>
      ) : (
        'Save Blog'
      )}
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Save as Blog Post</DialogTitle>
          <DialogDescription id="dialog-description">
            Create a new blog post from your translated content.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Description (optional)</label>
            <Textarea
              placeholder="Enter blog description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <SaveButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 