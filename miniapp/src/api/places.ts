import { PlacesDatabase } from '../../../shared/types';

const PLACES_URL = import.meta.env.VITE_PLACES_URL || 'https://vvershin.github.io/mef/places.json';

export const fetchPlaces = async (): Promise<PlacesDatabase> => {
  try {
    const response = await fetch(PLACES_URL, {
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching places:', error);

    const cached = localStorage.getItem('places_cache');
    if (cached) {
      console.log('Using cached places');
      return JSON.parse(cached);
    }

    throw error;
  }
};

export const cachePlaces = (data: PlacesDatabase): void => {
  try {
    localStorage.setItem('places_cache', JSON.stringify(data));
    localStorage.setItem('places_cache_time', new Date().toISOString());
  } catch (error) {
    console.error('Error caching places:', error);
  }
};
