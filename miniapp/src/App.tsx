import { useState, useEffect, useMemo } from 'react';
import { Event } from '../../shared/types';
import { EventCard } from './components/EventCard';
import { EventDetails } from './components/EventDetails';
import { FilterPanel, Filters } from './components/FilterPanel';
import { VersionWarning } from './components/VersionWarning';
import { useTelegram } from './hooks/useTelegram';
import { useCloudStorage } from './hooks/useCloudStorage';
import { fetchEvents, cacheEvents } from './api/events';
import { filterEvents, sortEvents } from './utils/filters';
import { Star, Filter } from 'lucide-react';

const MIN_TELEGRAM_VERSION = '6.1';

const isVersionSupported = (version: string, minVersion: string): boolean => {
  const [currentMajor, currentMinor] = version.split('.').map(Number);
  const [minMajor, minMinor] = minVersion.split('.').map(Number);
  
  return currentMajor > minMajor || (currentMajor === minMajor && currentMinor >= minMinor);
};

function App() {
  const { tg } = useTelegram();
  const [showVersionWarning, setShowVersionWarning] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [favorites, setFavorites] = useCloudStorage<number[]>('favorites', []);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    dateRange: 'all',
    priceRange: 'all',
    search: '',
  });

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

  useEffect(() => {
    loadEvents();
    
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

  const handleEventClick = (event: Event) => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('medium');
    }
    setSelectedEvent(event);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

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
      <div className="sticky top-0 bg-white z-10">
        <img 
          src="/header.png" 
          alt="Афиша мероприятий" 
          className="w-full h-auto"
        />
        
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex gap-2">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
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
