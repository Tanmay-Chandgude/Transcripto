"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotification } from '@/context/NotificationContext'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type User = {
  id: string
  email: string
  subscription_tier: string
  subscription_status: string
  role: string
  created_at: string
}

export default function UserManagement({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const { showNotification } = useNotification()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))

      showNotification({
        type: 'success',
        title: 'Role Updated',
        message: 'User role has been successfully updated.'
      })
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user role.'
      })
    }
  }

  const handleSubscriptionUpdate = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: status })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(user => 
        user.id === userId ? { ...user, subscription_status: status } : user
      ))

      showNotification({
        type: 'success',
        title: 'Subscription Updated',
        message: 'User subscription has been successfully updated.'
      })
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update subscription status.'
      })
    }
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.subscription_tier}</TableCell>
              <TableCell>{user.subscription_status}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      Manage
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage User: {user.email}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <h4 className="font-medium mb-2">Role</h4>
                        <div className="flex space-x-2">
                          {['user', 'moderator', 'admin'].map(role => (
                            <Button
                              key={role}
                              variant={user.role === role ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleRoleChange(user.id, role)}
                            >
                              {role}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Subscription Status</h4>
                        <div className="flex space-x-2">
                          {['active', 'inactive', 'cancelled'].map(status => (
                            <Button
                              key={status}
                              variant={user.subscription_status === status ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleSubscriptionUpdate(user.id, status)}
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 