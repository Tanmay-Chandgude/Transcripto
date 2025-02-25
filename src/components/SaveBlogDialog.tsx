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
  const { user, isLoading: isAuthLoading } = useKindeAuth()
  const { showNotification } = useNotification()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (isAuthLoading) {
      console.log('Auth still loading...');
      return;
    }

    if (!user?.id) {
      console.log('No user found:', user);
      showNotification({
        title: '❌ Error',
        message: 'Please sign in to save blogs',
        type: 'error'
      });
      return;
    }

    if (!title.trim()) {
      showNotification({
        title: '❌ Error',
        message: 'Please enter a title',
        type: 'error'
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('Attempting to save blog with user:', user.id);
      
      const { data, error } = await supabase.from('blogs').insert([{
        user_id: user.id,
        title: title.trim(),
        content: content,
        description: description.trim() || null,
        original_language: language,
        status: 'published',
        created_at: new Date().toISOString()
      }]).select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Blog saved successfully:', data);

      showNotification({
        title: '✨ Blog Created!',
        message: 'Your blog has been saved successfully.',
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
      disabled={!title.trim() || isSaving || isAuthLoading || !user}
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