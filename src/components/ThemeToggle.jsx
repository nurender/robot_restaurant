import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="robot-header-btn"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}

    >
      {theme === 'dark' ? (
        <Sun size={15} color="#fbbf24" />
      ) : (
        <Moon size={15} color="#818cf8" />
      )}
    </button>
  );
}
