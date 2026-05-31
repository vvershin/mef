import React, { useState, useEffect } from 'react';
import { EventsTable } from './components/EventsTable';
import { EventEditor } from './components/EventEditor';
import { PlacesTable } from './components/PlacesTable';
import { PlaceEditor } from './components/PlaceEditor';
import { Event, Place } from '../../shared/types';
import {
  loadEvents, saveEvents, downloadJSON, importFromJSON, cleanOldEvents,
  loadPlaces, savePlaces, downloadPlacesJSON, importPlacesFromJSON,
} from './utils/storage';
import { Plus, Download, Upload, Trash2 } from 'lucide-react';

type Tab = 'events' | 'places';

function App() {
  const [tab, setTab] = useState<Tab>('events');

  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);

  const [places, setPlaces] = useState<Place[]>([]);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [showPlaceEditor, setShowPlaceEditor] = useState(false);

  useEffect(() => {
    setEvents(loadEvents());
    setPlaces(loadPlaces());
  }, []);

  // ── Events ────────────────────────────────────────────────
  const handleCreateEvent = () => { setEditingEvent(null); setShowEventEditor(true); };
  const handleEditEvent = (event: Event) => { setEditingEvent(event); setShowEventEditor(true); };

  const handleSaveEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let updated: Event[];
    if (editingEvent) {
      updated = events.map(e =>
        e.id === editingEvent.id
          ? { ...eventData, id: e.id, createdAt: e.createdAt, updatedAt: now } as Event
          : e
      );
    } else {
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      updated = [...events, { ...eventData, id: newId, createdAt: now, updatedAt: now } as Event];
    }
    setEvents(updated);
    saveEvents(updated);
    setShowEventEditor(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: number) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    saveEvents(updated);
  };

  const handleToggleEventFeatured = (id: number) => {
    const updated = events.map(e =>
      e.id === id ? { ...e, isFeatured: !e.isFeatured, updatedAt: new Date().toISOString() } : e
    );
    setEvents(updated);
    saveEvents(updated);
  };

  const handleImportEvents = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setEvents(cleaned);
    saveEvents(cleaned);
    alert(`Удалено ${events.length - cleaned.length} прошедших мероприятий`);
  };

  // ── Places ────────────────────────────────────────────────
  const handleCreatePlace = () => { setEditingPlace(null); setShowPlaceEditor(true); };
  const handleEditPlace = (place: Place) => { setEditingPlace(place); setShowPlaceEditor(true); };

  const handleSavePlace = (placeData: Omit<Place, 'id'>) => {
    let updated: Place[];
    if (editingPlace) {
      updated = places.map(p =>
        p.id === editingPlace.id ? { ...placeData, id: p.id } as Place : p
      );
    } else {
      const newId = places.length > 0 ? Math.max(...places.map(p => p.id)) + 1 : 1;
      updated = [...places, { ...placeData, id: newId } as Place];
    }
    setPlaces(updated);
    savePlaces(updated);
    setShowPlaceEditor(false);
    setEditingPlace(null);
  };

  const handleDeletePlace = (id: number) => {
    const updated = places.filter(p => p.id !== id);
    setPlaces(updated);
    savePlaces(updated);
  };

  const handleTogglePlaceFeatured = (id: number) => {
    const updated = places.map(p =>
      p.id === id ? { ...p, isFeatured: !p.isFeatured, updatedAt: new Date().toISOString() } : p
    );
    setPlaces(updated);
    savePlaces(updated);
  };

  const handleImportPlaces = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importPlacesFromJSON(file);
      setPlaces(imported);
      savePlaces(imported);
      alert(`Импортировано ${imported.length} мест`);
    } catch (error) {
      alert('Ошибка импорта: ' + (error as Error).message);
    }
    e.target.value = '';
  };

  // ── Render ────────────────────────────────────────────────
  const isEvents = tab === 'events';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">

          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-gray-200 flex gap-4">
            <button
              onClick={() => setTab('events')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                isEvents ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Мероприятия ({events.length})
            </button>
            <button
              onClick={() => setTab('places')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                !isEvents ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Места ({places.length})
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {isEvents ? 'Управление мероприятиями' : 'Управление местами'}
              </h1>
              <div className="flex gap-2">
                {isEvents && (
                  <button
                    onClick={handleCleanOld}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <Trash2 size={18} />
                    Очистить старые
                  </button>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload size={18} />
                  Импорт
                  <input
                    type="file"
                    accept=".json"
                    onChange={isEvents ? handleImportEvents : handleImportPlaces}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => isEvents ? downloadJSON(events) : downloadPlacesJSON(places)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <Download size={18} />
                  Экспорт JSON
                </button>
                <button
                  onClick={isEvents ? handleCreateEvent : handleCreatePlace}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Plus size={18} />
                  {isEvents ? 'Создать мероприятие' : 'Создать место'}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            {isEvents ? (
              <EventsTable
                events={events}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                onToggleFeatured={handleToggleEventFeatured}
              />
            ) : (
              <PlacesTable
                places={places}
                onEdit={handleEditPlace}
                onDelete={handleDeletePlace}
                onToggleFeatured={handleTogglePlaceFeatured}
              />
            )}
          </div>

          {/* Instructions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Инструкция:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Создайте и отредактируйте {isEvents ? 'мероприятия' : 'места'}</li>
                <li>Нажмите "Экспорт JSON" для сохранения файла {isEvents ? 'events.json' : 'places.json'}</li>
                <li>Разместите файл в папке docs/ вашего GitHub репозитория</li>
                <li>Сделайте git push — Mini App автоматически получит обновления</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {showEventEditor && (
        <EventEditor
          event={editingEvent || undefined}
          onSave={handleSaveEvent}
          onClose={() => { setShowEventEditor(false); setEditingEvent(null); }}
        />
      )}

      {showPlaceEditor && (
        <PlaceEditor
          place={editingPlace || undefined}
          onSave={handleSavePlace}
          onClose={() => { setShowPlaceEditor(false); setEditingPlace(null); }}
        />
      )}
    </div>
  );
}

export default App;
