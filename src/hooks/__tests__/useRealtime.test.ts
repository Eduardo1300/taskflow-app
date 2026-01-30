import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtime } from '../useRealtime';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    }),
    removeChannel: vi.fn().mockResolvedValue({ status: 'unsubscribed' }),
  },
}));

describe('useRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should subscribe to channel on mount', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.1',
        onEvent: vi.fn(),
      })
    );

    expect(supabase.channel).toHaveBeenCalledWith('public:tasks');
    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should unsubscribe on unmount', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const { unmount } = renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.1',
        onEvent: vi.fn(),
      })
    );

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('should call onEvent when postgres change occurs', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    const onEvent = vi.fn();

    renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.1',
        onEvent,
      })
    );

    const callback = mockChannel.on.mock.calls[0][2];
    
    act(() => {
      callback({
        eventType: 'INSERT',
        new: { id: 1, title: 'New Task' },
        old: null,
      });
    });

    expect(onEvent).toHaveBeenCalledWith({
      eventType: 'INSERT',
      new: { id: 1, title: 'New Task' },
      old: null,
    });
  });

  it('should pass correct filter to channel', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.123',
        onEvent: vi.fn(),
      })
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        filter: 'user_id=eq.123',
      }),
      expect.any(Function)
    );
  });

  it('should handle all event types', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.1',
        onEvent: vi.fn(),
      })
    );

    expect(mockChannel.on).toHaveBeenCalled();
  });

  it('should subscribe with correct schema', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.1',
        onEvent: vi.fn(),
      })
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        schema: 'public',
      }),
      expect.any(Function)
    );
  });

  it('should subscribe to correct table', () => {
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockResolvedValue({ status: 'subscribed' }),
    };

    (supabase.channel as any).mockReturnValue(mockChannel);

    renderHook(() => 
      useRealtime({
        table: 'tasks',
        filter: 'user_id=eq.1',
        onEvent: vi.fn(),
      })
    );

    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'tasks',
      }),
      expect.any(Function)
    );
  });
});
