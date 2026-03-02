import { Event } from '../../../shared/types';

export const validateEvent = (event: Partial<Event>): string[] => {
  const errors: string[] = [];

  if (!event.title || event.title.trim().length === 0) {
    errors.push('Название обязательно');
  }

  if (!event.description || event.description.trim().length === 0) {
    errors.push('Описание обязательно');
  }

  if (!event.category) {
    errors.push('Категория обязательна');
  }

  if (!event.date) {
    errors.push('Дата обязательна');
  } else {
    const eventDate = new Date(event.date);
    if (isNaN(eventDate.getTime())) {
      errors.push('Некорректная дата');
    }
  }

  if (event.registrationUrl && !isValidUrl(event.registrationUrl)) {
    errors.push('Некорректная ссылка на регистрацию');
  }

  if (event.imageUrl && !isValidUrl(event.imageUrl)) {
    errors.push('Некорректная ссылка на изображение');
  }

  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
