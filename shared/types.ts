export enum EventCategory {
  CONCERT = 'concert',
  THEATER = 'theater',
  EXHIBITION = 'exhibition',
  SPORT = 'sport',
  FESTIVAL = 'festival',
  WORKSHOP = 'workshop',
  CONFERENCE = 'conference',
  PARTY = 'party',
  CINEMA = 'cinema',
  OTHER = 'other'
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  [EventCategory.CONCERT]: '🎵 Концерт',
  [EventCategory.THEATER]: '🎭 Театр',
  [EventCategory.EXHIBITION]: '🖼️ Выставка',
  [EventCategory.SPORT]: '⚽ Спорт',
  [EventCategory.FESTIVAL]: '🎪 Фестиваль',
  [EventCategory.WORKSHOP]: '🎨 Мастер-класс',
  [EventCategory.CONFERENCE]: '💼 Конференция',
  [EventCategory.PARTY]: '🎉 Вечеринка',
  [EventCategory.CINEMA]: '🎬 Кино',
  [EventCategory.OTHER]: '📌 Другое'
};

export interface Event {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  
  date: string;
  time?: string;
  endDate?: string;
  
  location?: string;
  address?: string;
  
  price?: string;
  isFree?: boolean;
  
  registrationUrl?: string;
  imageUrl?: string;
  
  organizer?: string;
  contactInfo?: string;
  
  tags?: string[];
  isFeatured?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface EventsDatabase {
  events: Event[];
  lastUpdated: string;
  version: string;
}
