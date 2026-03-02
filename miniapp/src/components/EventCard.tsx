import React from 'react';
import { Event, CATEGORY_LABELS } from '../../../shared/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock, MapPin, DollarSign, Star, ExternalLink } from 'lucide-react';

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClick: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isFavorite, 
  onToggleFavorite,
  onClick 
}) => {
  const eventDate = new Date(event.date);
  const categoryLabel = CATEGORY_LABELS[event.category];

  return (
    <div 
      className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow p-4"
      onClick={() => onClick(event)}
    >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {categoryLabel}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(event.id);
            }}
            className={`p-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span>{format(eventDate, 'd MMMM yyyy', { locale: ru })}</span>
          </div>

          {event.time && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span>{event.time}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            <span className="font-medium">
              {event.isFree ? '🆓 Бесплатно' : (event.price || 'Цена не указана')}
            </span>
          </div>
        </div>

        {event.registrationUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.Telegram?.WebApp?.openLink(event.registrationUrl!);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ExternalLink size={16} />
            Регистрация
          </button>
        )}
    </div>
  );
};
