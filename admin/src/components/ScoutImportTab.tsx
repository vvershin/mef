import React, { useState } from 'react';
import { Event, CATEGORY_LABELS, ScoutReport } from '../../../shared/types';
import { EventEditor } from './EventEditor';
import { parseScoutReport, scoutEventToDraft, isDuplicateEvent, DraftEvent } from '../utils/scoutImport';
import { TelegramSettings, getWeekRange, buildWeekMessages, sendTelegramMessage } from '../utils/telegram';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Upload, Trash2, Edit2, ExternalLink, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface ImportRow {
  key: string;
  draft: DraftEvent;
  sourceUrl: string;
  matchedBy?: string;
  included: boolean;
}

interface ScoutImportTabProps {
  existingEvents: Event[];
  onExport: (newEvents: DraftEvent[]) => void;
  tgSettings: TelegramSettings | null;
  onOpenTgSettings: () => void;
}

export const ScoutImportTab: React.FC<ScoutImportTabProps> = ({ existingEvents, onExport, tgSettings, onOpenTgSettings }) => {
  const [report, setReport] = useState<ScoutReport | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [dupSkipped, setDupSkipped] = useState(0);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  /** Дубликаты базы (та же дата и url/название) в окно импорта не попадают */
  const buildRows = (data: ScoutReport): ImportRow[] => {
    const result: ImportRow[] = [];
    let skipped = 0;
    data.events.forEach((se, i) => {
      const draft = scoutEventToDraft(se);
      if (isDuplicateEvent(draft, existingEvents)) {
        skipped++;
        return;
      }
      result.push({
        key: `${se.url}#${se.date}#${i}`,
        draft,
        sourceUrl: se.sourceUrl,
        matchedBy: se.matchedBy,
        included: true,
      });
    });
    setDupSkipped(skipped);
    return result;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const data = await parseScoutReport(file);
      setReport(data);
      setRows(buildRows(data));
    } catch (err) {
      setError('Ошибка загрузки отчета: ' + (err as Error).message);
    }
    e.target.value = '';
  };

  const toggleIncluded = (key: string) => {
    setRows(rows.map((r) => (r.key === key ? { ...r, included: !r.included } : r)));
  };

  const removeRow = (key: string) => {
    setRows(rows.filter((r) => r.key !== key));
  };

  const handleSaveRow = (data: DraftEvent) => {
    if (!editingKey) return;
    setRows(rows.map((r) => (r.key === editingKey ? { ...r, draft: data } : r)));
    setEditingKey(null);
  };

  const handleExport = () => {
    if (rows.length === 0) return;
    onExport(rows.filter((r) => r.included).map((r) => r.draft));
  };

  /** События текущей календарной недели (Пн–Вс) среди отмеченных — для рассылки */
  const weekRows = () => {
    const { monday, sunday } = getWeekRange();
    return rows.filter((r) => r.included && r.draft.date >= monday && r.draft.date <= sunday);
  };

  const handleSendTelegram = async () => {
    if (!tgSettings) { onOpenTgSettings(); return; }
    const weekEvents = weekRows().map((r) => r.draft);
    if (weekEvents.length === 0) {
      alert('Среди отмеченных нет событий текущей недели (Пн–Вс).');
      return;
    }
    const chunks = buildWeekMessages(weekEvents);
    if (!confirm(`Отправить в Telegram события недели (${weekEvents.length} шт., сообщений: ${chunks.length})?`)) return;
    setSending(true);
    try {
      for (const chunk of chunks) {
        await sendTelegramMessage(tgSettings, chunk);
      }
      alert(`✅ Отправлено в Telegram: ${weekEvents.length} событий недели.`);
    } catch (err) {
      alert('Ошибка отправки: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const includedCount = rows.filter((r) => r.included).length;
  const editingRow = rows.find((r) => r.key === editingKey);

  const fmtDate = (d: string): string => {
    try {
      return format(new Date(d), 'dd.MM.yyyy', { locale: ru });
    } catch {
      return d;
    }
  };

  /* ── Пустое состояние: загрузка отчета ── */
  if (!report) {
    return (
      <div>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-16 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <Upload size={40} className="text-gray-400 mb-3" />
          <span className="text-lg font-medium text-gray-700">Загрузите файл отчета</span>
          <span className="text-sm text-gray-500 mt-1">
            reports/scout-report-&lt;дата&gt;.json — результат работы агента-скаута
          </span>
          <input type="file" accept=".json" onChange={handleFile} className="hidden" />
        </label>
        {error && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2"><strong>Как получить отчет:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Запустите агента-скаута (сбор по сайтам из scout.config.json)</li>
            <li>Возьмите свежий файл из папки <code>reports/</code> репозитория</li>
            <li>Загрузите его здесь, удалите ненужное, отредактируйте поля</li>
            <li>Нажмите «Выгрузить в базу» — события объединятся с мероприятиями</li>
          </ol>
        </div>
      </div>
    );
  }

  /* ── Таблица модерации ── */
  return (
    <div>
      {/* Шапка отчета */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">Отчет скаута</span>
          {' · '}
          в списке {rows.length}
          {dupSkipped > 0 && ` · пропущено дубликатов (уже в базе): ${dupSkipped}`}
          {' · '}
          к выгрузке: <strong>{includedCount}</strong>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">
            <Upload size={18} />
            Другой отчет
            <input type="file" accept=".json" onChange={handleFile} className="hidden" />
          </label>
          <button
            onClick={handleSendTelegram}
            disabled={sending}
            title="Сформировать сообщение «la semaine française» из событий текущей недели и отправить ботом подписчику"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Send size={18} />
            {sending ? 'Отправка...' : `✨ В Telegram (${weekRows().length})`}
          </button>
          <button
            onClick={handleExport}
            disabled={includedCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            Выгрузить в базу ({includedCount})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">{error}</div>
      )}

      {/* Таблица */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Дата</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Время</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Место</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Источник</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={row.included}
                    onChange={() => toggleIncluded(row.key)}
                    className="rounded"
                    title={row.included ? 'Исключить из выгрузки' : 'Включить в выгрузку'}
                  />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{fmtDate(row.draft.date)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.draft.time || '-'}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="max-w-xs truncate font-medium text-gray-900" title={row.draft.title}>
                    {row.draft.title}
                  </div>
                  {row.matchedBy && (
                    <div className="text-xs text-gray-400 truncate" title={row.matchedBy}>
                      {row.matchedBy}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {CATEGORY_LABELS[row.draft.category]}
                </td>
                <td className="px-3 py-2 text-sm">
                  <div className="max-w-[10rem] truncate text-gray-500" title={row.draft.location || ''}>
                    {row.draft.location || '-'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.draft.isFree ? 'Бесплатно' : (row.draft.price || '-')}
                </td>
                <td className="px-3 py-2 text-sm">
                  <a
                    href={row.draft.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                    title={`Событие: ${row.draft.registrationUrl}\nНайдено на: ${row.sourceUrl}`}
                  >
                    <ExternalLink size={16} />
                  </a>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditingKey(row.key)}
                    className="text-gray-400 hover:text-blue-500 mr-3"
                    title="Редактировать"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => removeRow(row.key)}
                    className="text-gray-400 hover:text-red-500"
                    title="Удалить из списка"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                  Список пуст — все записи уже есть в базе или удалены. Загрузите другой отчет.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Подсказка */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Записи, уже существующие в базе (та же дата и ссылка/название), в список не попадают — только новые.
          ✏️ — редактирование всех полей · 🗑 — удаление события из списка · чекбокс — исключить из выгрузки без удаления.
        </p>
      </div>

      {editingRow && (
        <EventEditor
          event={{ ...editingRow.draft, id: 0, createdAt: '', updatedAt: '' } as Event}
          onSave={handleSaveRow}
          onClose={() => setEditingKey(null)}
        />
      )}
    </div>
  );
};
