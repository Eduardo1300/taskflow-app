// Re-exportar tipos de la base de datos
export type { 
  Task, TaskInsert, TaskUpdate, 
  Profile, 
  TaskCollaborator, TaskCollaboratorInsert, TaskCollaboratorUpdate,
  CollaborationInvitation, CollaborationInvitationInsert, CollaborationInvitationUpdate,
  TaskActivity, TaskActivityInsert, TaskActivityUpdate
} from './database';

// Importar tipos para uso interno
import type { 
  Task, 
  TaskCollaborator, 
  Profile, 
  CollaborationInvitation 
} from './database';

// Tipos locales para compatibilidad
export interface User {
  id: string;
  name: string;
  email: string;
}

// Tipo extendido para tareas con colaboración
export interface TaskWithCollaboration extends Task {
  collaborators?: TaskCollaborator[];
  is_shared?: boolean;
  user_permission?: 'owner' | 'view' | 'edit' | 'admin';
  owner?: Profile;
}

// Tipo para invitaciones pendientes
export interface PendingInvitation extends CollaborationInvitation {
  task?: Task;
  inviter?: Profile;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}