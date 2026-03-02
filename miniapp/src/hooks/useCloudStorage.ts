import { useState, useEffect, useCallback } from 'react';

const isCloudStorageSupported = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return false;
  
  // Cloud Storage доступен с версии 6.1+
  const version = tg.version || '6.0';
  const [major, minor] = version.split('.').map(Number);
  
  return (major > 6 || (major === 6 && minor >= 1)) && !!tg.CloudStorage;
};

export const useCloudStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const tg = window.Telegram?.WebApp;
  const useCloud = isCloudStorageSupported();

  useEffect(() => {
    if (useCloud && tg?.CloudStorage) {
      // Используем Telegram Cloud Storage
      tg.CloudStorage.getItem(key, (error, result) => {
        if (!error && result) {
          try {
            setValue(JSON.parse(result));
          } catch (e) {
            console.error('Error parsing cloud storage value:', e);
          }
        }
        setLoading(false);
      });
    } else {
      // Fallback на localStorage
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          setValue(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
      setLoading(false);
    }
  }, [key, tg, useCloud]);

  const updateValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const nextValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(value) : newValue;
    setValue(nextValue);
    
    if (useCloud && tg?.CloudStorage) {
      // Сохраняем в Telegram Cloud Storage
      tg.CloudStorage.setItem(key, JSON.stringify(nextValue), (error) => {
        if (error) {
          console.error('Error saving to cloud storage:', error);
        }
      });
    } else {
      // Сохраняем в localStorage
      try {
        localStorage.setItem(key, JSON.stringify(nextValue));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [key, tg, value, useCloud]);

  return [value, updateValue, loading] as const;
};
