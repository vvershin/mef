import { useState, useEffect, useCallback } from 'react';

export const useCloudStorage = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg?.CloudStorage) {
      setLoading(false);
      return;
    }

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
  }, [key, tg]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
    if (tg?.CloudStorage) {
      tg.CloudStorage.setItem(key, JSON.stringify(newValue), (error) => {
        if (error) {
          console.error('Error saving to cloud storage:', error);
        }
      });
    }
  }, [key, tg]);

  return [value, updateValue, loading] as const;
};
