import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export default function ThemeManager({ children }) {
  const { settings } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  }, [settings.theme]);

  return <>{children}</>;
}
