import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface RealtimeUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
}

export const useKanbanRealtime = (boardId?: string) => {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!boardId) return;

    // Subscribe to task changes
    const taskChannel = supabase
      .channel(`board-${boardId}-tasks`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          const update: RealtimeUpdate = {
            type: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            table: 'tasks',
            record: payload.new,
            old_record: payload.old,
          };
          
          setUpdates(prev => [...prev.slice(-9), update]); // Keep last 10 updates
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to user presence
    const presenceChannel = supabase
      .channel(`board-${boardId}-presence`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat();
        setConnectedUsers(users as any[]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [boardId]);

  const broadcastUserActivity = async (activity: {
    user_id: string;
    user_name: string;
    action: string;
    task_id?: number;
    timestamp: string;
  }) => {
    if (!boardId) return;

    await supabase
      .channel(`board-${boardId}-presence`)
      .track(activity);
  };

  return {
    updates,
    connectedUsers,
    isConnected,
    broadcastUserActivity,
    clearUpdates: () => setUpdates([]),
  };
};
