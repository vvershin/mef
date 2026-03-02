import React from 'react';
import { Event, CATEGORY_LABELS } from '../../../shared/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X, Calendar, Clock, MapPin, DollarSign, User, Phone, ExternalLink, Tag } from 'lucide-react';

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose }) => {
  const eventDate = new Date(event.date);
  const categoryLabel = CATEGORY_LABELS[event.category];
  const tg = window.Telegram?.WebApp;

  const handleOpenLink = (url: string) => {
    if (tg) {
      tg.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-bold">Детали мероприятия</h2>
        <button onClick={onClose} className="text-gray-500">
          <X size={24} />
        </button>
      </div>

      <div className="px-4 py-4">
          <div className="mb-4">
            <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {categoryLabel}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">
                  {format(eventDate, 'd MMMM yyyy', { locale: ru })}
                </div>
                {event.endDate && (
                  <div className="text-sm text-gray-600">
                    до {format(new Date(event.endDate), 'd MMMM yyyy', { locale: ru })}
                  </div>
                )}
              </div>
            </div>

            {event.time && (
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-900">{event.time}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{event.location}</div>
                  {event.address && (
                    <div className="text-sm text-gray-600">{event.address}</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900">
                {event.isFree ? '🆓 Бесплатно' : (event.price || 'Цена не указана')}
              </span>
            </div>

            {event.organizer && (
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-900">{event.organizer}</span>
              </div>
            )}

            {event.contactInfo && (
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-900">{event.contactInfo}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Описание</h3>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900">Теги</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.registrationUrl && (
            <button
              onClick={() => handleOpenLink(event.registrationUrl!)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 text-white rounded-lg font-medium text-lg hover:bg-blue-600 transition-colors"
            >
              <ExternalLink size={20} />
              Регистрация / Билеты
            </button>
          )}
      </div>
    </div>
  );
};
