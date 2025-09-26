import { useI18n } from '@/contexts/I18nContext';

const LanguageSwitcher = () => {
  const { locale, setLocale } = useI18n();
  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => setLocale(e.target.value as any)}
      className="bg-background border border-border rounded px-2 py-1 text-sm"
    >
      <option value="en">EN</option>
      <option value="zh">中文</option>
      <option value="ja">日本語</option>
    </select>
  );
};

export default LanguageSwitcher;


