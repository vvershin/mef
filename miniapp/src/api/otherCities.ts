import { OtherCitiesDatabase } from '../../../shared/types';

const OTHER_CITIES_URL = import.meta.env.VITE_OTHER_CITIES_URL || 'https://vvershin.github.io/mef/other-cities.json';

export const fetchOtherCities = async (): Promise<OtherCitiesDatabase> => {
  try {
    const response = await fetch(OTHER_CITIES_URL, {
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching other cities:', error);

    const cached = localStorage.getItem('other_cities_cache');
    if (cached) {
      console.log('Using cached other cities');
      return JSON.parse(cached);
    }

    throw error;
  }
};

export const cacheOtherCities = (data: OtherCitiesDatabase): void => {
  try {
    localStorage.setItem('other_cities_cache', JSON.stringify(data));
    localStorage.setItem('other_cities_cache_time', new Date().toISOString());
  } catch (error) {
    console.error('Error caching other cities:', error);
  }
};
