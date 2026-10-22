import React from 'react';
import { useForm } from 'react-hook-form';
import { TelegramSettings, saveTelegramSettings } from '../utils/telegram';
import { X } from 'lucide-react';

interface Props {
  initial: TelegramSettings | null;
  onSave: (settings: TelegramSettings) => void;
  onClose: () => void;
}

export const TelegramSettingsModal: React.FC<Props> = ({ initial, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TelegramSettings>({
    defaultValues: initial ?? { token: '', chatId: '' },
  });

  const onSubmit = (data: TelegramSettings) => {
    saveTelegramSettings(data);
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-bold">Настройки Telegram-рассылки</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Токен бота *
            </label>
            <input
              {...register('token', { required: true })}
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789:AA..."
            />
            {errors.token && <p className="text-red-500 text-xs mt-1">Обязательное поле</p>}
            <p className="text-xs text-gray-400 mt-1">
              Создайте бота у @BotFather (/newbot) и скопируйте токен
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat ID подписчика *
            </label>
            <input
              {...register('chatId', { required: true })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789"
            />
            {errors.chatId && <p className="text-red-500 text-xs mt-1">Обязательное поле</p>}
            <p className="text-xs text-gray-400 mt-1">
              Узнайте свой id у @userinfobot; подписчик должен сначала написать боту (/start)
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-700">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
