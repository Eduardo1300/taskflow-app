import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: any;
  old?: any;
  table: string;
}

interface UseRealtimeProps {
  table: string;
  filter?: string;
  onEvent?: (event: RealtimeEvent) => void;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtime = ({
  table,
  filter,
  onEvent,
  onInsert,
  onUpdate,
  onDelete
}: UseRealtimeProps) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}${filter ? `:${filter}` : ''}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...(filter && { filter })
        },
        (payload) => {
          const event: RealtimeEvent = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
            table: table
          };

          // Llamar el callback general
          onEvent?.(event);

          // Llamar callbacks específicos
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload.new);
              break;
            case 'UPDATE':
              onUpdate?.(payload.new);
              break;
            case 'DELETE':
              onDelete?.(payload.old);
              break;
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, filter, onEvent, onInsert, onUpdate, onDelete]);

  return channelRef.current;
};

// Hook específico para tareas
export const useTasksRealtime = (
  userId: string,
  onTasksChange?: (event: RealtimeEvent) => void
) => {
  return useRealtime({
    table: 'tasks',
    filter: `user_id=eq.${userId}`,
    onEvent: onTasksChange
  });
};

// Hook específico para colaboraciones
export const useCollaborationsRealtime = (
  userId: string,
  onCollaborationChange?: (event: RealtimeEvent) => void
) => {
  return useRealtime({
    table: 'task_collaborators',
    filter: `user_id=eq.${userId}`,
    onEvent: onCollaborationChange
  });
};

// Hook específico para invitaciones
export const useInvitationsRealtime = (
  userEmail: string,
  onInvitationChange?: (event: RealtimeEvent) => void
) => {
  return useRealtime({
    table: 'collaboration_invitations',
    filter: `invited_email=eq.${userEmail}`,
    onEvent: onInvitationChange
  });
};

// Hook específico para actividad de tareas
export const useTaskActivityRealtime = (
  taskId: number,
  onActivityChange?: (event: RealtimeEvent) => void
) => {
  return useRealtime({
    table: 'task_activity',
    filter: `task_id=eq.${taskId}`,
    onEvent: onActivityChange
  });
};
