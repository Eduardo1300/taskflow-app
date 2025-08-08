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
          tags: string[] | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          user_id: string
          category?: string | null
          tags?: string[] | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          user_id?: string
          category?: string | null
          tags?: string[] | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | null
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
      task_collaborators: {
        Row: {
          id: number
          task_id: number
          user_id: string
          permission: 'view' | 'edit' | 'admin'
          shared_by: string
          created_at: string
        }
        Insert: {
          id?: number
          task_id: number
          user_id: string
          permission?: 'view' | 'edit' | 'admin'
          shared_by: string
          created_at?: string
        }
        Update: {
          id?: number
          task_id?: number
          user_id?: string
          permission?: 'view' | 'edit' | 'admin'
          shared_by?: string
          created_at?: string
        }
      }
      collaboration_invitations: {
        Row: {
          id: number
          task_id: number
          invited_email: string
          invited_by: string
          permission: 'view' | 'edit' | 'admin'
          status: 'pending' | 'accepted' | 'declined'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: number
          task_id: number
          invited_email: string
          invited_by: string
          permission?: 'view' | 'edit' | 'admin'
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: number
          task_id?: number
          invited_email?: string
          invited_by?: string
          permission?: 'view' | 'edit' | 'admin'
          status?: 'pending' | 'accepted' | 'declined'
          created_at?: string
          expires_at?: string
        }
      }
      task_activity: {
        Row: {
          id: number
          task_id: number
          user_id: string
          action: string
          details: any
          created_at: string
        }
        Insert: {
          id?: number
          task_id: number
          user_id: string
          action: string
          details?: any
          created_at?: string
        }
        Update: {
          id?: number
          task_id?: number
          user_id?: string
          action?: string
          details?: any
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos auxiliares para las tareas
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Tipos auxiliares para los perfiles
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Tipos auxiliares para colaboradores
export type TaskCollaborator = Database['public']['Tables']['task_collaborators']['Row']
export type TaskCollaboratorInsert = Database['public']['Tables']['task_collaborators']['Insert']
export type TaskCollaboratorUpdate = Database['public']['Tables']['task_collaborators']['Update']

// Tipos auxiliares para invitaciones
export type CollaborationInvitation = Database['public']['Tables']['collaboration_invitations']['Row']
export type CollaborationInvitationInsert = Database['public']['Tables']['collaboration_invitations']['Insert']
export type CollaborationInvitationUpdate = Database['public']['Tables']['collaboration_invitations']['Update']

// Tipos auxiliares para actividad
export type TaskActivity = Database['public']['Tables']['task_activity']['Row']
export type TaskActivityInsert = Database['public']['Tables']['task_activity']['Insert']
export type TaskActivityUpdate = Database['public']['Tables']['task_activity']['Update']