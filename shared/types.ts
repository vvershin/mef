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
  FOR_KIDS = 'for_kids',
  CINEMA = 'cinema'
}

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  [EventCategory.LANGUAGE]: '🗣️ Язык',
  [EventCategory.ART]: '🏛️ Искусство',
  [EventCategory.THEATER]: '🎭 Театр',
  [EventCategory.MUSIC]: '🎵 Музыка',
  [EventCategory.SPORT]: '⚽ Спорт',
  [EventCategory.FOOD]: '🍰 Вкусненькое',
  [EventCategory.FESTIVAL]: '🎪 Фестиваль',
  [EventCategory.ENTERTAINMENT]: '🎉 Развлечения',
  [EventCategory.CREATIVITY]: '🎨 Творчество',
  [EventCategory.FOR_KIDS]: '🧸 Для детей',
  [EventCategory.CINEMA]: '🎬 Кино'
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

export enum PlaceCategory {
  RESTAURANT = 'restaurant',
  LEISURE = 'leisure',
  COLLECTION = 'collection',
}

export const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  [PlaceCategory.RESTAURANT]: '🍽️ Ресторан',
  [PlaceCategory.LEISURE]: '🎭 Досуг',
  [PlaceCategory.COLLECTION]: '📚 Подборка',
};

export interface Place {
  id: number;
  title: string;
  address?: string;
  category: PlaceCategory;
  url?: string;
  isFeatured?: boolean;
}

export interface PlacesDatabase {
  places: Place[];
  lastUpdated: string;
  version: string;
}

export interface OtherCityPlace {
  id: number;
  title: string;
  city?: string;
  category: PlaceCategory;
  url?: string;
  isFeatured?: boolean;
}

export interface OtherCitiesDatabase {
  places: OtherCityPlace[];
  lastUpdated: string;
  version: string;
}
