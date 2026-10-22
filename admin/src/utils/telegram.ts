import { DraftEvent } from './scoutImport';

export interface TelegramSettings {
  token: string;
  chatId: string;
}

const STORAGE_KEY = 'telegram_settings';

export const loadTelegramSettings = (): TelegramSettings | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveTelegramSettings = (settings: TelegramSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const HEADER = 'новая афиша, в которой собраны все французские события недели 💔\n\nla semaine française';
const FOOTER = 'bonne semaine ✨';
const WEEKEND_HEADER = 'le week-end français';
const MARKER = '✨';
/** запас до лимита Telegram в 4096 символов */
const MAX_LEN = 3900;

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Календарная неделя (Пн–Вс), к которой относится ref */
export const getWeekRange = (ref: Date = new Date()): { monday: string; sunday: string } => {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const offset = (d.getDay() + 6) % 7; // 0 = понедельник
  d.setDate(d.getDate() - offset);
  const monday = toISODate(d);
  d.setDate(d.getDate() + 6);
  return { monday, sunday: toISODate(d) };
};

/**
 * Формирует сообщение(я) «la semaine française» (формат согласован с владельцем):
 * дни по-французски, события маркером ✨, ссылка события — HTML-гиперссылка на названии.
 * Возвращает массив сообщений (Telegram ограничивает сообщение 4096 символами).
 */
export const buildWeekMessages = (events: DraftEvent[], ref: Date = new Date()): string[] => {
  const { monday, sunday } = getWeekRange(ref);
  const inWeek = events
    .filter((e) => e.date >= monday && e.date <= sunday)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));

  if (inWeek.length === 0) return [];

  const byDate = new Map<string, DraftEvent[]>();
  for (const e of inWeek) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  const dayBlocks: string[] = [];
  let weekendHeaderAdded = false;
  for (const [date, dayEvents] of byDate) {
    const d = new Date(date + 'T12:00:00');
    const weekday = d.getDay();
    if ((weekday === 6 || weekday === 0) && !weekendHeaderAdded && dayBlocks.length > 0) {
      dayBlocks.push(WEEKEND_HEADER);
      weekendHeaderAdded = true;
    }
    const lines = dayEvents.map((e) =>
      e.registrationUrl
        ? `${MARKER} <a href="${escapeHtml(e.registrationUrl)}">${escapeHtml(e.title)}</a>`
        : `${MARKER} ${escapeHtml(e.title)}`
    );
    dayBlocks.push([`${DAYS_FR[weekday]}, ${d.getDate()} ${MONTHS_FR[d.getMonth()]}`, ...lines].join('\n'));
  }

  return splitToChunks(HEADER, dayBlocks, FOOTER);
};

/** Разбивка на сообщения ≤ MAX_LEN: по строкам, заголовок дня приклеен к первому событию дня */
const splitToChunks = (header: string, dayBlocks: string[], footer: string): string[] => {
  const units: string[] = [header];
  for (const block of dayBlocks) {
    const lines = block.split('\n');
    if (lines.length === 1) {
      units.push(block); // например, «le week-end français»
      continue;
    }
    const dayHead = lines[0];
    for (let i = 1; i < lines.length; i++) {
      units.push(i === 1 ? `${dayHead}\n${lines[i]}` : lines[i]);
    }
  }

  const chunks: string[] = [];
  let cur: string[] = [];
  let curLen = 0;
  const push = (unit: string) => {
    const need = unit.length + (curLen > 0 ? 2 : 0);
    if (curLen > 0 && curLen + need > MAX_LEN) {
      chunks.push(cur.join('\n\n'));
      cur = [];
      curLen = 0;
    }
    cur.push(unit);
    curLen += unit.length + (cur.length > 1 ? 2 : 0);
  };

  for (const u of units) push(u);
  push(footer);
  if (cur.length > 0) chunks.push(cur.join('\n\n'));
  return chunks;
};

/** Отправка сообщения через Bot API напрямую из браузера (решение концепции §2.4) */
export const sendTelegramMessage = async (settings: TelegramSettings, text: string): Promise<void> => {
  const res = await fetch(`https://api.telegram.org/bot${settings.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: settings.chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok || data.ok !== true) {
    throw new Error((data as { description?: string }).description || `Telegram API error ${res.status}`);
  }
};
