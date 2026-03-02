import { Event } from '../../../shared/types';
import { Filters } from '../components/FilterPanel';
import { 
  startOfToday, 
  startOfTomorrow, 
  endOfTomorrow, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  isWithinInterval
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
        event.description.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    const eventDate = new Date(event.date);
    
    if (filters.dateRange !== 'all') {
      let dateMatches = false;
      
      switch (filters.dateRange) {
        case 'today':
          dateMatches = isWithinInterval(eventDate, {
            start: startOfToday(),
            end: endOfTomorrow()
          });
          break;
        case 'tomorrow':
          dateMatches = isWithinInterval(eventDate, {
            start: startOfTomorrow(),
            end: endOfTomorrow()
          });
          break;
        case 'week':
          dateMatches = isWithinInterval(eventDate, {
            start: startOfWeek(new Date(), { weekStartsOn: 1 }),
            end: endOfWeek(new Date(), { weekStartsOn: 1 })
          });
          break;
        case 'month':
          dateMatches = isWithinInterval(eventDate, {
            start: startOfMonth(new Date()),
            end: endOfMonth(new Date())
          });
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
