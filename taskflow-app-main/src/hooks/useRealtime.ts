import { useEffect, useRef } from 'react';

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
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log(`[useRealtime] Realtime disabled - using REST API`);
    channelRef.current = null;
  }, [table, filter, onEvent, onInsert, onUpdate, onDelete]);

  return channelRef.current;
};

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
