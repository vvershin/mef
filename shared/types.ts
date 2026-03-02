export enum EventCategory {
  LANGUAGE = 'language',
  ART = 'art',
  THEATER = 'theater',
  MUSIC = 'music',
  SPORT = 'sport',
  FOOD = 'food',
  FESTIVAL = 'festival',
  ENTERTAINMENT = 'entertainment',
  CREATIVITY = 'creativity',
  FOR_KIDS = 'for_kids'
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  [EventCategory.LANGUAGE]: '🗣️ Язык',
  [EventCategory.ART]: '🏛️ Искусство',
  [EventCategory.THEATER]: '🎭 Театр',
  [EventCategory.MUSIC]: '🎤 Музыка',
  [EventCategory.SPORT]: '⚽ Спорт',
  [EventCategory.FOOD]: '🍰 Вкусненькое',
  [EventCategory.FESTIVAL]: '🎪 Фестиваль',
  [EventCategory.ENTERTAINMENT]: '🎉 Развлечения',
  [EventCategory.CREATIVITY]: '🎨 Творчество',
  [EventCategory.FOR_KIDS]: '🧸 Для детей'
};

export interface Event {
  id: number;
  title: string;
  description?: string;
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
