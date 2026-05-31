import React from 'react';
import { useForm } from 'react-hook-form';
import { OtherCityPlace, PlaceCategory, PLACE_CATEGORY_LABELS } from '../../../shared/types';
import { X } from 'lucide-react';

interface OtherCityEditorProps {
  place?: OtherCityPlace;
  onSave: (place: Omit<OtherCityPlace, 'id'>) => void;
  onClose: () => void;
}

export const OtherCityEditor: React.FC<OtherCityEditorProps> = ({ place, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: place ? { ...place } : {
      title: '',
      city: '',
      category: PlaceCategory.RESTAURANT,
      url: '',
      isFeatured: false,
    },
  });

  const onSubmit = (data: any) => {
    onSave({
      ...data,
      city: data.city || undefined,
      url: data.url || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {place ? 'Редактировать место' : 'Новое место (другой город)'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
            <input
              {...register('title', { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Название места"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">Обязательное поле</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Категория *</label>
              <select
                {...register('category', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(PLACE_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
              <input
                {...register('city')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Санкт-Петербург"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка</label>
            <input
              {...register('url')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input {...register('isFeatured')} type="checkbox" className="rounded" />
              <span className="text-sm font-medium text-gray-700">⭐ Избранное</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              {place ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
