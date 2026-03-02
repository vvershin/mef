import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [tg] = useState(() => window.Telegram?.WebApp);
  const [user] = useState(tg?.initDataUnsafe?.user);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  return {
    tg,
    user,
    platform: tg?.platform,
    colorScheme: tg?.colorScheme,
    themeParams: tg?.themeParams,
  };
};
