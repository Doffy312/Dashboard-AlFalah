import { describe, it, expect } from 'vitest';

describe('Local-First Theme Preference & Multi-Device Independence Tests', () => {
  // Mock localStorage implementation for multi-device simulation
  class MockLocalStorage {
    private store: Record<string, string> = {};

    getItem(key: string): string | null {
      return this.store[key] ?? null;
    }

    setItem(key: string, value: string): void {
      this.store[key] = String(value);
    }

    removeItem(key: string): void {
      delete this.store[key];
    }

    clear(): void {
      this.store = {};
    }
  }

  const THEME_STORAGE_KEY = 'theme_preference';

  function resolveTheme(storage: MockLocalStorage): 'dark' | 'light' {
    const saved = storage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    const legacy = storage.getItem('settings_security');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (parsed?.theme === 'light' || parsed?.theme === 'dark') return parsed.theme;
      } catch {}
    }
    return 'dark'; // default theme
  }

  function toggleDeviceTheme(storage: MockLocalStorage): 'dark' | 'light' {
    const current = resolveTheme(storage);
    const next = current === 'light' ? 'dark' : 'light';
    storage.setItem(THEME_STORAGE_KEY, next);
    return next;
  }

  it('TC-THEME-001: should default to dark theme when storage is empty', () => {
    const laptopStorage = new MockLocalStorage();
    const theme = resolveTheme(laptopStorage);
    expect(theme).toBe('dark');
  });

  it('TC-THEME-002: should successfully toggle theme to light and persist in local storage', () => {
    const laptopStorage = new MockLocalStorage();
    const newTheme = toggleDeviceTheme(laptopStorage);
    expect(newTheme).toBe('light');
    expect(laptopStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('TC-THEME-003: Multi-device independence - Laptop and Phone maintain independent themes', () => {
    const laptopStorage = new MockLocalStorage();
    const phoneStorage = new MockLocalStorage();

    // 1. Both start as default dark
    expect(resolveTheme(laptopStorage)).toBe('dark');
    expect(resolveTheme(phoneStorage)).toBe('dark');

    // 2. User changes theme on Laptop to Light
    toggleDeviceTheme(laptopStorage);
    expect(resolveTheme(laptopStorage)).toBe('light');

    // 3. Verify Phone remains Dark (No cross-device contamination)
    expect(resolveTheme(phoneStorage)).toBe('dark');

    // 4. User sets Phone to Light, and Laptop back to Dark
    toggleDeviceTheme(phoneStorage);
    toggleDeviceTheme(laptopStorage);

    expect(resolveTheme(laptopStorage)).toBe('dark');
    expect(resolveTheme(phoneStorage)).toBe('light');
  });

  it('TC-THEME-004: Backward compatibility with legacy settings_security storage key', () => {
    const storage = new MockLocalStorage();
    storage.setItem('settings_security', JSON.stringify({ theme: 'light' }));
    
    // Should resolve legacy setting if new key is not set yet
    expect(resolveTheme(storage)).toBe('light');

    // Once user sets explicit new preference, it takes precedence
    storage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(resolveTheme(storage)).toBe('dark');
  });
});
