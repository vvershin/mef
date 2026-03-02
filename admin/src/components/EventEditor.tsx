import React from 'react';
import { useForm } from 'react-hook-form';
import { Event, EventCategory, CATEGORY_LABELS } from '../../../shared/types';
import { X } from 'lucide-react';
import { validateEvent } from '../utils/validation';

interface EventEditorProps {
  event?: Event;
  onSave: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const EventEditor: React.FC<EventEditorProps> = ({ event, onSave, onClose }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: event ? {
      ...event,
      date: event.date,
      time: event.time || '',
      endDate: event.endDate || '',
    } : {
      title: '',
      description: '',
      category: EventCategory.OTHER,
      date: '',
      time: '',
      endDate: '',
      location: '',
      address: '',
      price: '',
      isFree: false,
      registrationUrl: '',
      imageUrl: '',
      organizer: '',
      contactInfo: '',
      tags: [],
      isFeatured: false,
    }
  });

  const isFree = watch('isFree');

  const onSubmit = (data: any) => {
    const eventData = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      time: data.time || undefined,
      endDate: data.endDate || undefined,
      location: data.location || undefined,
      address: data.address || undefined,
      price: data.isFree ? undefined : (data.price || undefined),
      registrationUrl: data.registrationUrl || undefined,
      imageUrl: data.imageUrl || undefined,
      organizer: data.organizer || undefined,
      contactInfo: data.contactInfo || undefined,
    };

    const validationErrors = validateEvent(eventData);
    if (validationErrors.length > 0) {
      alert('Ошибки валидации:\n' + validationErrors.join('\n'));
      return;
    }

    onSave(eventData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {event ? 'Редактировать мероприятие' : 'Новое мероприятие'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                {...register('title', { required: true })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Концерт группы..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                {...register('description', { required: true })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Подробное описание мероприятия..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                {...register('category', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата *
              </label>
              <input
                {...register('date', { required: true })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Время
              </label>
              <input
                {...register('time')}
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата окончания
              </label>
              <input
                {...register('endDate')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Место проведения
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Клуб Космонавт"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                {...register('address')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ул. Ленина, 10"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  {...register('isFree')}
                  type="checkbox"
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Бесплатно</span>
              </label>
              {!isFree && (
                <input
                  {...register('price')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="500-1000₽"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ссылка на регистрацию
              </label>
              <input
                {...register('registrationUrl')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Организатор
              </label>
              <input
                {...register('organizer')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Название организации"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Контактная информация
              </label>
              <input
                {...register('contactInfo')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (xxx) xxx-xx-xx"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Теги (через запятую)
              </label>
              <input
                {...register('tags')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="рок, живая музыка, концерт"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  {...register('isFeatured')}
                  type="checkbox"
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">⭐ Избранное</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {event ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
