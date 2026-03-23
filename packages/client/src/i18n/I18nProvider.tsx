import { createContext, useState } from "react";
import zhCN from "./locales/zh-CN.json";
import { getDefaultLocale } from "./utils/getDefaultLocale";

export const I18nContext = createContext(null);

const messages: Record<string, any> = {
  "zh-CN": zhCN,
};

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(getDefaultLocale());
  const [localeMessages, setLocaleMessages] = useState(messages);

  const t = (key: string) => {
    const msg = localeMessages[locale]?.[key];

    if (!msg) {
      console.warn(`[i18n] Missing translation: ${key}`);
      return key;
    }

    return msg;
  };

  const changeLocale = async (newLocale: string) => {
    if (!localeMessages[newLocale]) {
      const module = await import(`./locales/${newLocale}.json`);
      setLocaleMessages((prev) => ({
        ...prev,
        [newLocale]: module.default,
      }));
    }

    setLocale(newLocale);
    localStorage.setItem("user-locale", newLocale);

    document.documentElement.lang = newLocale;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        t,
        changeLocale,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}












