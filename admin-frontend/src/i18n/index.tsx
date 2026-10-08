import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
type Locale = 'vi' | 'en';
const messages = { vi: { dashboard: 'Tổng quan', users: 'Người dùng', courses: 'Khóa học', enrollments: 'Ghi danh', profile: 'Hồ sơ', logout: 'Đăng xuất', console: 'Quản trị khóa học', system: 'QUẢN TRỊ HỆ THỐNG' }, en: { dashboard: 'Dashboard', users: 'Users', courses: 'Courses', enrollments: 'Enrollments', profile: 'Profile', logout: 'Logout', console: 'Course administration', system: 'SYSTEM MANAGEMENT' } } as const;
type Key = keyof typeof messages.vi;
const Context = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: (key: Key) => string }>({ locale: 'vi', setLocale: () => {}, t: key => messages.vi[key] });
const initial = (): Locale => document.cookie.match(/(?:^|; )pks_locale=(vi|en)/)?.[1] === 'en' ? 'en' : 'vi';
export function I18nProvider({ children }: { children: ReactNode }) { const [locale, set] = useState<Locale>(initial); const value = useMemo(() => ({ locale, setLocale: (next: Locale) => { document.cookie = `pks_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`; set(next); }, t: (key: Key) => messages[locale][key] }), [locale]); return <Context.Provider value={value}>{children}</Context.Provider>; }
export const useI18n = () => useContext(Context);
