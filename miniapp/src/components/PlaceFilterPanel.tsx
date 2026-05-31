import React from 'react';
import { PlaceCategory, PLACE_CATEGORY_LABELS } from '../../../shared/types';
import { X } from 'lucide-react';

export interface PlaceFilters {
  category: PlaceCategory | 'all';
}

interface PlaceFilterPanelProps {
  filters: PlaceFilters;
  onFiltersChange: (filters: PlaceFilters) => void;
  onClose: () => void;
}

export const PlaceFilterPanel: React.FC<PlaceFilterPanelProps> = ({ filters, onFiltersChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Фильтры</h2>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onFiltersChange({ category: 'all' })}
              className={`px-3 py-2 rounded-lg text-sm ${
                filters.category === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Все
            </button>
            {Object.entries(PLACE_CATEGORY_LABELS).map(([value, label]) => (
              <button
                key={value}
                onClick={() => onFiltersChange({ category: value as PlaceCategory })}
                className={`px-3 py-2 rounded-lg text-sm ${
                  filters.category === value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-6">
          <button
            onClick={() => onFiltersChange({ category: 'all' })}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium"
          >
            Сбросить
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
};
