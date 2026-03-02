import React from 'react';
import { EventCategory, CATEGORY_LABELS } from '../../../shared/types';
import { X } from 'lucide-react';

export interface Filters {
  category: EventCategory | 'all';
  dateRange: 'all' | 'today' | 'tomorrow' | 'week' | 'month';
  priceRange: 'all' | 'free' | 'paid';
  search: string;
}

interface FilterPanelProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  onFiltersChange,
  onClose 
}) => {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      category: 'all',
      dateRange: 'all',
      priceRange: 'all',
      search: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Фильтры</h2>
          <button onClick={onClose} className="text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Название мероприятия..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateFilter('category', 'all')}
                className={`px-3 py-2 rounded-lg text-sm ${
                  filters.category === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Все
              </button>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => updateFilter('category', value)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    filters.category === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дата
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'Все' },
                { value: 'today', label: 'Сегодня' },
                { value: 'tomorrow', label: 'Завтра' },
                { value: 'week', label: 'Эта неделя' },
                { value: 'month', label: 'Этот месяц' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('dateRange', value)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    filters.dateRange === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'Все' },
                { value: 'free', label: '🆓 Бесплатно' },
                { value: 'paid', label: '💰 Платно' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateFilter('priceRange', value)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    filters.priceRange === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={resetFilters}
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
    </div>
  );
};
