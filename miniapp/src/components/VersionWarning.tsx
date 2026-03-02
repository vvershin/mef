import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface VersionWarningProps {
  currentVersion: string;
  minVersion: string;
}

export const VersionWarning: React.FC<VersionWarningProps> = ({ currentVersion, minVersion }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={32} className="text-yellow-500" />
          <h2 className="text-xl font-bold">Требуется обновление</h2>
        </div>
        
        <div className="space-y-3 text-gray-700">
          <p>
            Для корректной работы приложения требуется Telegram версии <strong>{minVersion}</strong> или выше.
          </p>
          
          <p>
            Ваша версия: <strong>{currentVersion}</strong>
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Как обновить Telegram:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>iOS: App Store → Обновления</li>
              <li>Android: Google Play → Мои приложения</li>
              <li>Desktop: Скачать с telegram.org</li>
            </ul>
          </div>
          
          <p className="text-sm text-gray-600">
            Приложение продолжит работать, но некоторые функции (синхронизация избранного) будут недоступны.
          </p>
        </div>
        
        <button
          onClick={() => window.Telegram?.WebApp?.close()}
          className="w-full mt-6 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
