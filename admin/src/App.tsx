import React, { useState, useEffect } from 'react';
import { EventsTable } from './components/EventsTable';
import { EventEditor } from './components/EventEditor';
import { Event } from '../../shared/types';
import { loadEvents, saveEvents, downloadJSON, importFromJSON, cleanOldEvents } from './utils/storage';
import { Plus, Download, Upload, Trash2, RefreshCw } from 'lucide-react';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    const loaded = loadEvents();
    setEvents(loaded);
  }, []);

  const handleCreate = () => {
    setEditingEvent(null);
    setShowEditor(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowEditor(true);
  };

  const handleSave = (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingEvent) {
      const updated = events.map(e => 
        e.id === editingEvent.id 
          ? { ...eventData, id: e.id, createdAt: e.createdAt, updatedAt: now } as Event
          : e
      );
      setEvents(updated);
      saveEvents(updated);
    } else {
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      const newEvent: Event = {
        ...eventData,
        id: newId,
        createdAt: now,
        updatedAt: now,
      } as Event;
      const updated = [...events, newEvent];
      setEvents(updated);
      saveEvents(updated);
    }
    
    setShowEditor(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: number) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  const handleToggleFeatured = (id: number) => {
    const updated = events.map(e => 
      e.id === id ? { ...e, isFeatured: !e.isFeatured, updatedAt: new Date().toISOString() } : e
    );
    setEvents(updated);
    saveEvents(updated);
  };

  const handleExport = () => {
    downloadJSON(events);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importFromJSON(file);
      setEvents(imported);
      saveEvents(imported);
      alert(`Импортировано ${imported.length} мероприятий`);
    } catch (error) {
      alert('Ошибка импорта: ' + (error as Error).message);
    }
    e.target.value = '';
  };

  const handleCleanOld = () => {
    if (!confirm('Удалить все прошедшие мероприятия?')) return;
    
    const cleaned = cleanOldEvents(events);
    const removed = events.length - cleaned.length;
    setEvents(cleaned);
    saveEvents(cleaned);
    alert(`Удалено ${removed} прошедших мероприятий`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Управление мероприятиями
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Всего мероприятий: {events.length}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCleanOld}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  title="Удалить прошедшие"
                >
                  <Trash2 size={18} />
                  Очистить старые
                </button>
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload size={18} />
                  Импорт
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Download size={18} />
                  Экспорт JSON
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus size={18} />
                  Создать мероприятие
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <EventsTable
              events={events}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFeatured={handleToggleFeatured}
            />
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Инструкция:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Создайте и отредактируйте мероприятия</li>
                <li>Нажмите "Экспорт JSON" для сохранения файла events.json</li>
                <li>Разместите events.json в папке docs/ вашего GitHub репозитория</li>
                <li>Сделайте git push - Mini App автоматически получит обновления</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {showEditor && (
        <EventEditor
          event={editingEvent || undefined}
          onSave={handleSave}
          onClose={() => {
            setShowEditor(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
