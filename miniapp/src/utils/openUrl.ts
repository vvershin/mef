export const openUrl = (url: string): void => {
  const tg = window.Telegram?.WebApp;
  if (!tg) { window.open(url, '_blank'); return; }
  if (url.includes('t.me/')) {
    tg.openTelegramLink(url);
  } else {
    tg.openLink(url);
  }
};
