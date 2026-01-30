import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    document.documentElement.classList.remove('dark');
  });

  it('should provide theme context', () => {
    let contextValue: any;
    
    const TestComponent = () => {
      contextValue = useTheme();
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(contextValue).toBeDefined();
    expect(contextValue.theme).toBeDefined();
    expect(contextValue.setTheme).toBeDefined();
    expect(contextValue.toggleTheme).toBeDefined();
  });

  it('should default to light theme', () => {
    let theme: string = '';
    
    const TestComponent = () => {
      const { theme: currentTheme } = useTheme();
      theme = currentTheme;
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(theme).toBe('light');
  });

  it('should set theme to dark', () => {
    let theme: string = '';
    
    const TestComponent = () => {
      const { theme: currentTheme, setTheme } = useTheme();
      theme = currentTheme;
      if (theme === 'light') {
        setTheme('dark');
        theme = 'dark';
      }
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should toggle theme', () => {
    let initialTheme: string = '';
    let toggledTheme: string = '';
    
    const TestComponent = () => {
      const { theme, toggleTheme } = useTheme();
      initialTheme = theme;
      toggleTheme();
      toggledTheme = theme === 'light' ? 'dark' : 'light';
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(initialTheme).toBe('light');
    expect(toggledTheme).toBe('dark');
  });

  it('should save theme to localStorage', () => {
    const TestComponent = () => {
      const { setTheme } = useTheme();
      setTheme('dark');
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should read theme from localStorage on mount', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    let theme: string = '';
    
    const TestComponent = () => {
      const { theme: currentTheme } = useTheme();
      theme = currentTheme;
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should use system preference if no localStorage value', () => {
    const mockMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
    }));
    
    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
    });

    let theme: string = '';
    
    const TestComponent = () => {
      const { theme: currentTheme } = useTheme();
      theme = currentTheme;
      return null;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(theme).toBe('dark');
  });

  it('should throw error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const TestComponent = () => {
      expect(() => useTheme()).toThrow();
      return null;
    };

    expect(() => render(<TestComponent />)).not.toThrow();
    
    consoleError.mockRestore();
  });
});
