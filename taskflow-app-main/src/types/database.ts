export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: number
          title: string
          description: string | null
          completed: boolean
          created_at: string
          user_id: string
          category: string | null
          tags: string | null
          due_date: string | null
          priority: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          user_id: string
          category?: string | null
          tags?: string | null
          due_date?: string | null
          priority?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          user_id?: string
          category?: string | null
          tags?: string | null
          due_date?: string | null
          priority?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type TaskCollaborator = {
  id: number
  task_id: number
  user_id: string
  permission: 'view' | 'edit' | 'admin'
  shared_by: string
  created_at: string
}

export type TaskCollaboratorInsert = Partial<TaskCollaborator>
export type TaskCollaboratorUpdate = Partial<TaskCollaborator>

export type CollaborationInvitation = {
  id: number
  task_id: number
  invited_email: string
  invited_by: string
  permission: 'view' | 'edit' | 'admin'
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  expires_at: string
}

export type CollaborationInvitationInsert = Partial<CollaborationInvitation>
export type CollaborationInvitationUpdate = Partial<CollaborationInvitation>

export type TaskActivity = {
  id: number
  task_id: number
  user_id: string
  action: string
  details: Json
  created_at: string
}

export type TaskActivityInsert = Partial<TaskActivity>
export type TaskActivityUpdate = Partial<TaskActivity>
