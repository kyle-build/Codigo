import { createContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import zhCN from "./locales/zh-CN.json";
import { getDefaultLocale } from "./utils/getDefaultLocale";

type LocaleMessages = Record<string, Record<string, string>>;

interface I18nContextValue {
  locale: string;
  t: (key: string) => string;
  changeLocale: (newLocale: string) => Promise<void>;
}

const defaultMessages: LocaleMessages = {
  "zh-CN": zhCN,
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(getDefaultLocale());
  const [localeMessages, setLocaleMessages] =
    useState<LocaleMessages>(defaultMessages);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key: string) => localeMessages[locale]?.[key] ?? key,
      changeLocale: async (newLocale: string) => {
        if (!localeMessages[newLocale]) {
          const module = await import(`./locales/${newLocale}.json`);
          setLocaleMessages((prev) => ({
            ...prev,
            [newLocale]: module.default as Record<string, string>,
          }));
        }

        setLocale(newLocale);
        localStorage.setItem("user-locale", newLocale);
        document.documentElement.lang = newLocale;
      },
    }),
    [locale, localeMessages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
