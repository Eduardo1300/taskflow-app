import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../useOffline';

describe('useOffline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return online status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOnline).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOnline).toBe(false);
  });

  it('should add event listeners on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    renderHook(() => useOffline());

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(removeEventListenerSpy).not.toHaveBeenCalled();
  });

  it('should remove event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useOffline());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update isOnline when online event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    });

    const { result, rerender } = renderHook(() => useOffline());

    expect(result.current.isOnline).toBe(false);

    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    rerender();

    expect(result.current.isOnline).toBe(true);
  });

  it('should update isOnline when offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    const { result, rerender } = renderHook(() => useOffline());

    expect(result.current.isOnline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    rerender();

    expect(result.current.isOnline).toBe(false);
  });

  it('should provide manualSync function', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.manualSync).toBeDefined();
    expect(typeof result.current.manualSync).toBe('function');
  });

  it('should provide clearSyncError function', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.clearSyncError).toBeDefined();
    expect(typeof result.current.clearSyncError).toBe('function');
  });

  it('should have initial pending actions count', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.pendingActions).toBeDefined();
    expect(typeof result.current.pendingActions).toBe('number');
  });
});
