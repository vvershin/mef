import React from 'react';
import { useForm } from 'react-hook-form';
import { Place, PlaceCategory, PLACE_CATEGORY_LABELS } from '../../../shared/types';
import { X } from 'lucide-react';

interface PlaceEditorProps {
  place?: Place;
  onSave: (place: Omit<Place, 'id'>) => void;
  onClose: () => void;
}

export const PlaceEditor: React.FC<PlaceEditorProps> = ({ place, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: place ? {
      ...place,
    } : {
      title: '',
      address: '',
      category: PlaceCategory.RESTAURANT,
      url: '',
      isFeatured: false,
    },
  });

  const onSubmit = (data: any) => {
    const placeData = {
      ...data,
      address: data.address || undefined,
      url: data.url || undefined,
    };
    onSave(placeData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {place ? 'Редактировать место' : 'Новое место'}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
            <input
              {...register('address')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ул. Арбат, 10"
            />
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
              {place ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
