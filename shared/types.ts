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
  [EventCategory.FOOD]: '🍷 Вкусненькое',
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

/**
 * Отчет агента-скаута (см. CONCEPT.md п. 2 и .opencode/agents/scout.md).
 * Схема повторяет поля Event, чтобы импорт в админке не требовал преобразований,
 * и добавляет поля происхождения (url, sourceUrl, matchedBy).
 */
export interface ScoutReportEvent {
  /** Название мероприятия — обязательно */
  title: string;
  /** Дата проведения YYYY-MM-DD — обязательно, только будущее */
  date: string;
  /** Время HH:mm */
  time?: string;
  /** Конечная дата для диапазонов, YYYY-MM-DD */
  endDate?: string;
  /** Название площадки */
  location?: string;
  /** Адрес */
  address?: string;
  /** Прямая ссылка на страницу события — обязательно */
  url: string;
  /** Страница (список/агрегатор), на которой событие найдено — обязательно */
  sourceUrl: string;
  /** Категория из EventCategory, если удалось определить */
  category?: EventCategory;
  /** Цена как на сайте ("от 999 ₽", "Бесплатно") */
  price?: string;
  isFree?: boolean;
  /** Короткое описание на русском, 1–2 предложения */
  description?: string;
  organizer?: string;
  imageUrl?: string;
  /** Почему решено, что событие французское: ключевое слово или признак */
  matchedBy?: string;
}

export type ScoutSiteStatus = 'ok' | 'empty' | 'skipped' | 'error';

export interface ScoutSiteNote {
  /** URL из scout.config.json */
  url: string;
  status: ScoutSiteStatus;
  /** Сколько событий взято с сайта / причина статуса */
  comment?: string;
}

export interface ScoutReport {
  /** Дата запуска агента, ISO 8601 UTC */
  generatedAt: string;
  /** Путь к конфигу запуска */
  scoutConfig: string;
  /** Тема поиска из конфига */
  theme: string;
  /** Город поиска из конфига */
  city: string;
  events: ScoutReportEvent[];
  /** Итог обхода каждого сайта из конфига — обязательно для всех сайтов */
  siteNotes: ScoutSiteNote[];
}
