import { EventsDatabase } from '../../../shared/types';

const EVENTS_URL = import.meta.env.VITE_EVENTS_URL || 'https://your-username.github.io/your-repo/events.json';

export const fetchEvents = async (): Promise<EventsDatabase> => {
  try {
    const response = await fetch(EVENTS_URL, {
      cache: 'no-cache',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    
    const cached = localStorage.getItem('events_cache');
    if (cached) {
      console.log('Using cached events');
      return JSON.parse(cached);
    }
    
    throw error;
  }
};

export const cacheEvents = (data: EventsDatabase): void => {
  try {
    localStorage.setItem('events_cache', JSON.stringify(data));
    localStorage.setItem('events_cache_time', new Date().toISOString());
  } catch (error) {
    console.error('Error caching events:', error);
  }
};
