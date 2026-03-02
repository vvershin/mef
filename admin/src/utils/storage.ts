import { Event, EventsDatabase } from '../../../shared/types';

const STORAGE_KEY = 'events_database';

export const loadEvents = (): Event[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const db: EventsDatabase = JSON.parse(data);
    return db.events;
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
};

export const saveEvents = (events: Event[]): void => {
  try {
    const db: EventsDatabase = {
      events,
      lastUpdated: new Date().toISOString(),
      version: '1.0.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving events:', error);
    throw error;
  }
};

export const exportToJSON = (events: Event[]): string => {
  const db: EventsDatabase = {
    events,
    lastUpdated: new Date().toISOString(),
    version: '1.0.0'
  };
  return JSON.stringify(db, null, 2);
};

export const downloadJSON = (events: Event[]): void => {
  const json = exportToJSON(events);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'events.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<Event[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.events && Array.isArray(data.events)) {
          resolve(data.events);
        } else if (Array.isArray(data)) {
          resolve(data);
        } else {
          reject(new Error('Invalid JSON format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

export const cleanOldEvents = (events: Event[]): Event[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today;
  });
};
