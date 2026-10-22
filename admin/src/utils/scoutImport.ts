import { Event, EventCategory, ScoutReport, ScoutReportEvent } from '../../../shared/types';

/** Черновик события без служебных полей — id/createdAt/updatedAt назначаются при выгрузке */
export type DraftEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;

/** Читает и валидирует файл отчета агента-скаута (ScoutReport) */
export const parseScoutReport = (file: File): Promise<ScoutReport> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data || !Array.isArray(data.events)) {
          reject(new Error('Это не отчет скаута: нет массива events'));
          return;
        }
        const bad = data.events.filter(
          (ev: unknown) => !ev || typeof (ev as ScoutReportEvent).title !== 'string'
            || typeof (ev as ScoutReportEvent).date !== 'string'
            || typeof (ev as ScoutReportEvent).url !== 'string'
        );
        if (bad.length > 0) {
          reject(new Error(`Некорректные события в отчете (нет title/date/url): ${bad.length} шт.`));
          return;
        }
        resolve(data as ScoutReport);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

/**
 * Преобразование события отчета в черновик Event.
 * Решение концепции §2.2: url отчета → registrationUrl (мини-апп использует его как кнопку перехода).
 */
export const scoutEventToDraft = (se: ScoutReportEvent): DraftEvent => ({
  title: se.title.trim(),
  description: se.description || undefined,
  category: se.category ?? EventCategory.ENTERTAINMENT,
  date: se.date,
  time: se.time || undefined,
  endDate: se.endDate || undefined,
  location: se.location || undefined,
  address: se.address || undefined,
  price: se.isFree ? undefined : (se.price || undefined),
  isFree: se.isFree || undefined,
  registrationUrl: se.url,
  organizer: se.organizer || undefined,
  imageUrl: se.imageUrl || undefined,
  isFeatured: false,
});

const normalizeTitle = (title: string): string => title.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Дубликат по решению концепции §2.2–2.4: совпадает дата И (registrationUrl ИЛИ название).
 * Одинаковый url на разные даты — это серия показов, НЕ дубликат.
 */
export const isDuplicateEvent = (
  candidate: Pick<Event, 'title' | 'date'> & { registrationUrl?: string },
  existing: Event[]
): boolean => {
  const title = normalizeTitle(candidate.title);
  return existing.some((e) => {
    if (e.date !== candidate.date) return false;
    if (candidate.registrationUrl && e.registrationUrl && candidate.registrationUrl === e.registrationUrl) {
      return true;
    }
    return normalizeTitle(e.title) === title;
  });
};

/**
 * Объединяет новые события с существующей базой (решение концепции §4):
 * дубликаты (registrationUrl или название+дата) пропускаются,
 * id генерируются от максимального существующего, итог сортируется по дате.
 */
export const mergeEvents = (
  existing: Event[],
  incoming: DraftEvent[]
): { events: Event[]; added: number; skipped: number } => {
  const now = new Date().toISOString();
  const result = [...existing];
  let nextId = result.length > 0 ? Math.max(...result.map((e) => e.id)) : 0;
  let added = 0;
  let skipped = 0;

  for (const draft of incoming) {
    if (isDuplicateEvent(draft, result)) {
      skipped++;
      continue;
    }
    nextId++;
    result.push({ ...draft, id: nextId, createdAt: now, updatedAt: now });
    added++;
  }

  result.sort((a, b) => a.date.localeCompare(b.date));
  return { events: result, added, skipped };
};
