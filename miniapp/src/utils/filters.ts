import { Event } from '../../../shared/types';
import { Filters } from '../components/FilterPanel';
import { 
  startOfToday, 
  startOfTomorrow, 
  endOfTomorrow, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth
} from 'date-fns';

export const filterEvents = (events: Event[], filters: Filters): Event[] => {
  return events.filter(event => {
    if (filters.category !== 'all' && event.category !== filters.category) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        event.title.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    const eventStart = new Date(event.date);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
    
    if (filters.dateRange !== 'all') {
      let dateMatches = false;

      const overlaps = (rangeStart: Date, rangeEnd: Date) =>
        eventStart <= rangeEnd && eventEnd >= rangeStart;
      
      switch (filters.dateRange) {
        case 'today':
          dateMatches = overlaps(startOfToday(), endOfTomorrow());
          break;
        case 'tomorrow':
          dateMatches = overlaps(startOfTomorrow(), endOfTomorrow());
          break;
        case 'week':
          dateMatches = overlaps(
            startOfWeek(new Date(), { weekStartsOn: 1 }),
            endOfWeek(new Date(), { weekStartsOn: 1 })
          );
          break;
        case 'month':
          dateMatches = overlaps(startOfMonth(new Date()), endOfMonth(new Date()));
          break;
      }
      
      if (!dateMatches) return false;
    }

    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'free' && !event.isFree) {
        return false;
      }
      if (filters.priceRange === 'paid' && event.isFree) {
        return false;
      }
    }

    return true;
  });
};

export const sortEvents = (events: Event[]): Event[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
};
