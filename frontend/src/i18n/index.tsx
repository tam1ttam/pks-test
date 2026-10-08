import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
type Locale = 'vi' | 'en';
const messages = { vi: { home: 'Trang chủ', courses: 'Khóa học', myCourses: 'Khóa học của tôi', profile: 'Hồ sơ', logout: 'Đăng xuất', account: 'Tài khoản', language: 'Ngôn ngữ' }, en: { home: 'Home', courses: 'Courses', myCourses: 'My courses', profile: 'Profile', logout: 'Logout', account: 'Account', language: 'Language' } } as const;
type Key = keyof typeof messages.vi;
const Context = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: Key) => string }>({ locale: 'vi', setLocale: () => {}, t: key => messages.vi[key] });
const initial = (): Locale => document.cookie.match(/(?:^|; )pks_locale=(vi|en)/)?.[1] === 'en' ? 'en' : 'vi';
export function I18nProvider({ children }: { children: ReactNode }) { const [locale, set] = useState<Locale>(initial); const value = useMemo(() => ({ locale, setLocale: (next: Locale) => { document.cookie = `pks_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`; set(next); }, t: (key: Key) => messages[locale][key] }), [locale]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export const useI18n = () => useContext(Context);
