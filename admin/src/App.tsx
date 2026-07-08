import React, { useState, useEffect } from 'react';
import { EventsTable } from './components/EventsTable';
import { EventEditor } from './components/EventEditor';
import { PlacesTable } from './components/PlacesTable';
import { PlaceEditor } from './components/PlaceEditor';
import { OtherCitiesTable } from './components/OtherCitiesTable';
import { OtherCityEditor } from './components/OtherCityEditor';
import { Event, Place, OtherCityPlace } from '../../shared/types';
import {
  loadEvents, saveEvents, downloadJSON, importFromJSON, cleanOldEvents,
  loadPlaces, savePlaces, downloadPlacesJSON, importPlacesFromJSON,
  loadOtherCities, saveOtherCities, downloadOtherCitiesJSON, importOtherCitiesFromJSON,
} from './utils/storage';
import { GitHubSettingsModal } from './components/GitHubSettingsModal';
import { GitHubSettings, loadGitHubSettings, publishFileToGitHub, fetchFileFromGitHub } from './utils/github';
import { Plus, Download, Trash2, Github, Settings, ChevronDown, FileDown, FileUp } from 'lucide-react';

type Tab = 'events' | 'places' | 'other-cities';

function App() {
  const [tab, setTab] = useState<Tab>('events');
  const [ghSettings, setGhSettings] = useState<GitHubSettings | null>(loadGitHubSettings);
  const [showGhSettings, setShowGhSettings] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [gitMenuOpen, setGitMenuOpen] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEventEditor, setShowEventEditor] = useState(false);

  const [places, setPlaces] = useState<Place[]>([]);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [showPlaceEditor, setShowPlaceEditor] = useState(false);

  const [otherCities, setOtherCities] = useState<OtherCityPlace[]>([]);
  const [editingOtherCity, setEditingOtherCity] = useState<OtherCityPlace | null>(null);
  const [showOtherCityEditor, setShowOtherCityEditor] = useState(false);

  useEffect(() => {
    setEvents(loadEvents());
    setPlaces(loadPlaces());
    setOtherCities(loadOtherCities());
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

  // ── Other Cities ──────────────────────────────────────────
  const handleCreateOtherCity = () => { setEditingOtherCity(null); setShowOtherCityEditor(true); };
  const handleEditOtherCity = (place: OtherCityPlace) => { setEditingOtherCity(place); setShowOtherCityEditor(true); };

  const handleSaveOtherCity = (placeData: Omit<OtherCityPlace, 'id'>) => {
    let updated: OtherCityPlace[];
    if (editingOtherCity) {
      updated = otherCities.map(p =>
        p.id === editingOtherCity.id ? { ...placeData, id: p.id } as OtherCityPlace : p
      );
    } else {
      const newId = otherCities.length > 0 ? Math.max(...otherCities.map(p => p.id)) + 1 : 1;
      updated = [...otherCities, { ...placeData, id: newId } as OtherCityPlace];
    }
    setOtherCities(updated);
    saveOtherCities(updated);
    setShowOtherCityEditor(false);
    setEditingOtherCity(null);
  };

  const handleDeleteOtherCity = (id: number) => {
    const updated = otherCities.filter(p => p.id !== id);
    setOtherCities(updated);
    saveOtherCities(updated);
  };

  const handleToggleOtherCityFeatured = (id: number) => {
    const updated = otherCities.map(p =>
      p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setOtherCities(updated);
    saveOtherCities(updated);
  };

  const handleImportOtherCities = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importOtherCitiesFromJSON(file);
      setOtherCities(imported);
      saveOtherCities(imported);
      alert(`Импортировано ${imported.length} мест`);
    } catch (error) {
      alert('Ошибка импорта: ' + (error as Error).message);
    }
    e.target.value = '';
  };

  // ── GitHub Publish ─────────────────────────────────────────
  const handlePublish = async () => {
    if (!ghSettings) { setShowGhSettings(true); return; }
    const fileMap: Record<Tab, { path: string; data: object; label: string }> = {
      events: { path: 'docs/events.json', data: { events, lastUpdated: new Date().toISOString(), version: '1.0.0' }, label: 'events.json' },
      places: { path: 'docs/places.json', data: { places, lastUpdated: new Date().toISOString(), version: '1.0.0' }, label: 'places.json' },
      'other-cities': { path: 'docs/other-cities.json', data: { places: otherCities, lastUpdated: new Date().toISOString(), version: '1.0.0' }, label: 'other-cities.json' },
    };
    const { path, data, label } = fileMap[tab];
    setPublishing(true);
    try {
      await publishFileToGitHub(ghSettings, path, data, `Update ${label} via admin panel`);
      alert(`✅ ${label} опубликован в репозиторий!`);
    } catch (err) {
      alert('Ошибка публикации: ' + (err as Error).message);
    } finally {
      setPublishing(false);
    }
  };

  // ── GitHub Pull ──────────────────────────────────────────────
  const handlePullFromGitHub = async () => {
    if (!ghSettings) { setShowGhSettings(true); return; }
    const fileMap: Record<Tab, { path: string; label: string }> = {
      events: { path: 'docs/events.json', label: 'events.json' },
      places: { path: 'docs/places.json', label: 'places.json' },
      'other-cities': { path: 'docs/other-cities.json', label: 'other-cities.json' },
    };
    const { path, label } = fileMap[tab];
    setPulling(true);
    try {
      const data = await fetchFileFromGitHub(ghSettings, path) as any;
      if (isEvents) {
        const pulled: Event[] = data.events ?? [];
        setEvents(pulled);
        saveEvents(pulled);
      } else if (isOtherCities) {
        const pulled: OtherCityPlace[] = data.places ?? [];
        setOtherCities(pulled);
        saveOtherCities(pulled);
      } else {
        const pulled: Place[] = data.places ?? [];
        setPlaces(pulled);
        savePlaces(pulled);
      }
      alert(`✅ ${label} загружен из GitHub!`);
    } catch (err) {
      alert('Ошибка загрузки: ' + (err as Error).message);
    } finally {
      setPulling(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  const isEvents = tab === 'events';
  const isOtherCities = tab === 'other-cities';

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
                tab === 'places' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Места в Москве ({places.length})
            </button>
            <button
              onClick={() => setTab('other-cities')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                isOtherCities ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Другие города ({otherCities.length})
            </button>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">
                {isEvents ? 'Управление мероприятиями' : isOtherCities ? 'Другие города' : 'Места в Москве'}
              </h1>
              <div className="flex gap-2 items-center">
                {isEvents && (
                  <button
                    onClick={handleCleanOld}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <Trash2 size={18} />
                    Очистить старые
                  </button>
                )}

                {/* Файлы dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setFileMenuOpen(!fileMenuOpen); setGitMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <FileDown size={18} />
                    Файлы
                    <ChevronDown size={16} />
                  </button>
                  {fileMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setFileMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                        <label className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                          <FileUp size={16} />
                          Импорт JSON
                          <input
                            type="file"
                            accept=".json"
                            onChange={isEvents ? handleImportEvents : isOtherCities ? handleImportOtherCities : handleImportPlaces}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => {
                            isEvents ? downloadJSON(events) : isOtherCities ? downloadOtherCitiesJSON(otherCities) : downloadPlacesJSON(places);
                            setFileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <FileDown size={16} />
                          Экспорт JSON
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* GitHub dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setGitMenuOpen(!gitMenuOpen); setFileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700"
                  >
                    <Github size={18} />
                    GitHub
                    <ChevronDown size={16} />
                  </button>
                  {gitMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setGitMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                        <button
                          onClick={() => { handlePublish(); setGitMenuOpen(false); }}
                          disabled={publishing}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Github size={16} />
                          {publishing ? 'Публикация...' : 'Опубликовать'}
                        </button>
                        <button
                          onClick={() => { handlePullFromGitHub(); setGitMenuOpen(false); }}
                          disabled={pulling}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Download size={16} />
                          {pulling ? 'Загрузка...' : 'Загрузить из GitHub'}
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => { setShowGhSettings(true); setGitMenuOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings size={16} />
                          Настройки GitHub
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={isEvents ? handleCreateEvent : isOtherCities ? handleCreateOtherCity : handleCreatePlace}
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
            ) : isOtherCities ? (
              <OtherCitiesTable
                places={otherCities}
                onEdit={handleEditOtherCity}
                onDelete={handleDeleteOtherCity}
                onToggleFeatured={handleToggleOtherCityFeatured}
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
                <li>Нажмите "Экспорт JSON" для сохранения файла {isEvents ? 'events.json' : isOtherCities ? 'other-cities.json' : 'places.json'}</li>
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

      {showGhSettings && (
        <GitHubSettingsModal
          initial={ghSettings}
          onSave={setGhSettings}
          onClose={() => setShowGhSettings(false)}
        />
      )}

      {showOtherCityEditor && (
        <OtherCityEditor
          place={editingOtherCity || undefined}
          onSave={handleSaveOtherCity}
          onClose={() => { setShowOtherCityEditor(false); setEditingOtherCity(null); }}
        />
      )}
    </div>
  );
}

export default App;
