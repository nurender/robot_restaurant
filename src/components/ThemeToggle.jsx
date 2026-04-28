import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${theme}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      <span className="toggle-track">
        <span className="toggle-thumb">
          {theme === 'dark' ? (
            <Moon size={12} strokeWidth={2.5} />
          ) : (
            <Sun size={12} strokeWidth={2.5} />
          )}
        </span>
      </span>
    </button>
  );
}
