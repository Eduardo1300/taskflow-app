import { useEffect, useState } from 'react';

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

    console.log(`[useKanbanRealtime] Realtime disabled - using REST API`);
    setIsConnected(false);

    return () => {};
  }, [boardId]);

  const broadcastUserActivity = async (activity: {
    user_id: string;
    user_name: string;
    action: string;
    task_id?: number;
    timestamp: string;
  }) => {
    console.log('[useKanbanRealtime] Activity broadcast disabled');
  };

  return {
    updates,
    connectedUsers,
    isConnected,
    broadcastUserActivity,
    clearUpdates: () => setUpdates([]),
  };
};
