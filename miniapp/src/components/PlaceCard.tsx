import React from 'react';
import { Place, PLACE_CATEGORY_LABELS } from '../../../shared/types';
import { MapPin, ExternalLink, Star } from 'lucide-react';
import { openUrl } from '../utils/openUrl';

interface PlaceCardProps {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, isFavorite, onToggleFavorite }) => {
  const categoryLabel = PLACE_CATEGORY_LABELS[place.category];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
          {categoryLabel}
        </span>
        <button
          onClick={() => onToggleFavorite(place.id)}
          className={`p-1 ${isFavorite ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{place.title}</h3>

      {place.address && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
          <MapPin size={16} className="text-gray-400 shrink-0" />
          <span>{place.address}</span>
        </div>
      )}

      {place.url && (
        <button
          onClick={() => openUrl(place.url!)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <ExternalLink size={16} />
          Подробнее
        </button>
      )}
    </div>
  );
};
