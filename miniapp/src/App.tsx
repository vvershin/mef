import { useState, useEffect, useMemo } from 'react';
import { Event, Place } from '../../shared/types';
import { EventCard } from './components/EventCard';
import { EventDetails } from './components/EventDetails';
import { FilterPanel, Filters } from './components/FilterPanel';
import { PlaceCard } from './components/PlaceCard';
import { PlaceFilterPanel, PlaceFilters } from './components/PlaceFilterPanel';
import { VersionWarning } from './components/VersionWarning';
import { useTelegram } from './hooks/useTelegram';
import { useCloudStorage } from './hooks/useCloudStorage';
import { fetchEvents, cacheEvents } from './api/events';
import { fetchPlaces, cachePlaces } from './api/places';
import { filterEvents, sortEvents } from './utils/filters';
import { Star, Filter, ArrowLeft } from 'lucide-react';

const MIN_TELEGRAM_VERSION = '6.1';

type Screen = 'home' | 'events-moscow' | 'places-moscow' | 'other-cities';

const isVersionSupported = (version: string, minVersion: string): boolean => {
  const [currentMajor, currentMinor] = version.split('.').map(Number);
  const [minMajor, minMinor] = minVersion.split('.').map(Number);
  
  return currentMajor > minMajor || (currentMajor === minMajor && currentMinor >= minMinor);
};

function App() {
  const { tg } = useTelegram();
  const [screen, setScreen] = useState<Screen>('home');
  const [showVersionWarning, setShowVersionWarning] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [favorites, setFavorites] = useCloudStorage<number[]>('favorites', []);
  const [placeFavorites, setPlaceFavorites] = useCloudStorage<number[]>('place_favorites', []);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    dateRange: 'all',
    priceRange: 'all',
    search: '',
  });

  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [showPlaceFilters, setShowPlaceFilters] = useState(false);
  const [showPlaceFavoritesOnly, setShowPlaceFavoritesOnly] = useState(false);
  const [placeFilters, setPlaceFilters] = useState<PlaceFilters>({ category: 'all' });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      setEvents(data.events);
      cacheEvents(data);
    } catch (err) {
      setError('Не удалось загрузить мероприятия');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlaces = async () => {
    try {
      setPlacesLoading(true);
      setPlacesError(null);
      const data = await fetchPlaces();
      setPlaces(data.places);
      cachePlaces(data);
    } catch (err) {
      setPlacesError('Не удалось загрузить места');
      console.error(err);
    } finally {
      setPlacesLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadPlaces();
    
    // Проверка версии Telegram
    const version = tg?.version || '6.0';
    if (!isVersionSupported(version, MIN_TELEGRAM_VERSION)) {
      setShowVersionWarning(true);
    }
  }, [tg]);

  const filteredEvents = useMemo(() => {
    let result = filterEvents(events, filters);
    
    if (showFavoritesOnly) {
      result = result.filter(event => favorites.includes(event.id));
    }
    
    return sortEvents(result);
  }, [events, filters, showFavoritesOnly, favorites]);

  const filteredPlaces = useMemo(() => {
    let result = places;
    if (placeFilters.category !== 'all') {
      result = result.filter(p => p.category === placeFilters.category);
    }
    if (showPlaceFavoritesOnly) {
      result = result.filter(p => placeFavorites.includes(p.id));
    }
    return result;
  }, [places, placeFilters, showPlaceFavoritesOnly, placeFavorites]);

  const toggleFavorite = (id: number) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    
    setFavorites((prev) => 
      prev.includes(id) 
        ? prev.filter((fid) => fid !== id)
        : [...prev, id]
    );
  };

  const togglePlaceFavorite = (id: number) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
    setPlaceFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleEventClick = (event: Event) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
    setSelectedEvent(event);
  };

  const handleBackToHome = () => {
    setScreen('home');
    setSelectedEvent(null);
    setShowFilters(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Куда пойти?</h1>
        <p className="text-gray-500 mb-8 text-center text-sm">Выбери раздел</p>
        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={() => setScreen('events-moscow')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all text-left"
          >
            <div>
              <div className="font-bold text-gray-900 text-lg">События в Москве</div>
              <div className="text-sm text-gray-500">Все французские мероприятия столицы</div>
            </div>
          </button>

          <button
            onClick={() => setScreen('places-moscow')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all text-left"
          >
            <div>
              <div className="font-bold text-gray-900 text-lg">Места в Москве</div>
              <div className="text-sm text-gray-500">Проверенные локации с французским настроением</div>
            </div>
          </button>

          <button
            onClick={() => setScreen('other-cities')}
            className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all text-left"
          >
            <div>
              <div className="font-bold text-gray-900 text-lg">Другие города</div>
              <div className="text-sm text-gray-500">Места и события по всей России + авторские гайды</div>
            </div>
          </button>
        </div>
        {showVersionWarning && (
          <VersionWarning
            currentVersion={tg?.version || '6.0'}
            minVersion={MIN_TELEGRAM_VERSION}
          />
        )}
      </div>
    );
  }

  if (screen === 'places-moscow' || screen === 'other-cities') {
    const cityPlaces = filteredPlaces;
    const placeFilterActive = placeFilters.category !== 'all';

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <div className="flex gap-2">
            <button
              onClick={handleBackToHome}
              className="flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-700 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>

            <button
              onClick={() => setShowPlaceFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg flex-1"
            >
              <Filter size={18} />
              Фильтры
              {placeFilterActive && (
                <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">1</span>
              )}
            </button>

            <button
              onClick={() => setShowPlaceFavoritesOnly(!showPlaceFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shrink-0 ${
                showPlaceFavoritesOnly ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Star size={18} fill={showPlaceFavoritesOnly ? 'currentColor' : 'none'} />
              {placeFavorites.length > 0 && (
                <span className="text-sm font-medium">{placeFavorites.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="p-4">
          {placesLoading && places.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            </div>
          ) : placesError && places.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{placesError}</p>
              <button onClick={loadPlaces} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                Попробовать снова
              </button>
            </div>
          ) : cityPlaces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">
                {showPlaceFavoritesOnly ? 'Нет избранных мест' : 'Места не найдены'}
              </p>
              {(placeFilterActive || showPlaceFavoritesOnly) && (
                <button
                  onClick={() => {
                    setShowPlaceFavoritesOnly(false);
                    setPlaceFilters({ category: 'all' });
                  }}
                  className="text-blue-500 text-sm"
                >
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">Найдено мест: {cityPlaces.length}</p>
              <div className="grid grid-cols-1 gap-4">
                {cityPlaces.map(place => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isFavorite={placeFavorites.includes(place.id)}
                    onToggleFavorite={togglePlaceFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {showPlaceFilters && (
          <PlaceFilterPanel
            filters={placeFilters}
            onFiltersChange={setPlaceFilters}
            onClose={() => setShowPlaceFilters(false)}
          />
        )}
      </div>
    );
  }

  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Загрузка мероприятий...</p>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadEvents}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex gap-2">
          <button
            onClick={handleBackToHome}
            className="flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-700 shrink-0"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg flex-1"
          >
            <Filter size={18} />
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="bg-white text-blue-500 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shrink-0 ${
              showFavoritesOnly 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Star size={18} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
            {favorites.length > 0 && (
              <span className="text-sm font-medium">{favorites.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">
              {showFavoritesOnly 
                ? 'Нет избранных мероприятий' 
                : 'Мероприятий не найдено'}
            </p>
            {(activeFiltersCount > 0 || showFavoritesOnly) && (
              <button
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setFilters({
                    category: 'all',
                    dateRange: 'all',
                    priceRange: 'all',
                    search: '',
                  });
                }}
                className="text-blue-500 text-sm"
              >
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Найдено мероприятий: {filteredEvents.length}
            </p>
            <div className="grid grid-cols-1 gap-4">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorite={favorites.includes(event.id)}
                  onToggleFavorite={toggleFavorite}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {showVersionWarning && (
        <VersionWarning
          currentVersion={tg?.version || '6.0'}
          minVersion={MIN_TELEGRAM_VERSION}
        />
      )}
    </div>
  );
}

export default App;
