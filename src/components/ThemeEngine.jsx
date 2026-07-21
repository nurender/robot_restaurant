import React, { useEffect } from 'react';
import apiService from '../services/apiService';
import { useTheme } from '../context/ThemeContext';

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '124, 58, 237';
};

/**
 * ThemeEngine - Globally applies Dynamic Theme Management variables.
 * Needs an organizationId to know which theme to fetch.
 */
export default function ThemeEngine({ organizationId = 1 }) {
  const { theme: localTheme } = useTheme();

  useEffect(() => {
    const applyDynamicTheme = async () => {
      if (!organizationId) return;
      try {
        const res = await apiService.getOrgTheme(organizationId);
        if (res.data?.success && res.data?.data) {
          const theme = res.data.data;
          const root = document.documentElement;
          
          if (theme.primary_color) {
            root.style.setProperty('--accent-primary', theme.primary_color);
            root.style.setProperty('--ap-accent-color', theme.primary_color);
          }
          if (theme.secondary_color) root.style.setProperty('--accent-secondary', theme.secondary_color);
          if (theme.accent_color) {
            root.style.setProperty('--accent-color', theme.accent_color);
            const rgb = hexToRgb(theme.accent_color);
            root.style.setProperty('--accent-glow', `rgba(${rgb}, 0.35)`);
            root.style.setProperty('--accent-light', `rgba(${rgb}, 0.15)`);
          }
          if (theme.button_color) root.style.setProperty('--button-color', theme.button_color);
          
          // Override backend theme styles if local theme toggle is explicitly used
          if (localTheme === 'light') {
            root.style.setProperty('--sidebar-bg', '#ffffff');
            root.style.setProperty('--ap-sidebar-bg', '#ffffff');
            root.style.setProperty('--sidebar-text', '#0f172a');
            root.style.setProperty('--sidebar-text-muted', '#64748b');
            root.style.setProperty('--sidebar-hover', 'rgba(124, 58, 237, 0.08)');
            root.style.setProperty('--sidebar-border', 'rgba(0, 0, 0, 0.08)');
            
            root.style.setProperty('--bg-deep', '#f8fafc');
            root.style.setProperty('--ap-main-bg', '#f8fafc');
            root.style.setProperty('--card-bg', '#ffffff');
            root.style.setProperty('--ap-card-bg', '#ffffff');
            root.style.setProperty('--ap-glass-bg', 'rgba(255, 255, 255, 0.6)');
            root.style.setProperty('--text-main', '#0f172a');
            root.style.setProperty('--ap-text-main', '#0f172a');
          } else {
            // Apply backend theme or default dark mode
            const isBackendLight = theme.sidebar_style === 'light';
            root.style.setProperty('--sidebar-bg', isBackendLight ? '#ffffff' : (theme.sidebar_color || '#09090b'));
            root.style.setProperty('--ap-sidebar-bg', isBackendLight ? '#ffffff' : (theme.sidebar_color || '#09090b'));
            root.style.setProperty('--sidebar-text', isBackendLight ? '#0f172a' : '#ffffff');
            root.style.setProperty('--sidebar-text-muted', isBackendLight ? '#64748b' : '#a1a1aa');
            root.style.setProperty('--sidebar-hover', isBackendLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)');
            root.style.setProperty('--sidebar-border', isBackendLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)');

            if (theme.background_color) {
              root.style.setProperty('--bg-deep', theme.background_color);
              root.style.setProperty('--ap-main-bg', theme.background_color);
            } else {
              root.style.setProperty('--bg-deep', '#050508');
              root.style.setProperty('--ap-main-bg', '#050508');
            }

            if (theme.card_color) {
              root.style.setProperty('--card-bg', theme.card_color);
              root.style.setProperty('--ap-card-bg', theme.card_color);
              root.style.setProperty('--ap-glass-bg', theme.card_color);
            } else {
              root.style.setProperty('--card-bg', 'rgba(24, 24, 27, 0.4)');
              root.style.setProperty('--ap-card-bg', 'rgba(24, 24, 27, 0.4)');
              root.style.setProperty('--ap-glass-bg', 'rgba(24, 24, 27, 0.6)');
            }

            if (theme.text_color) {
              root.style.setProperty('--text-main', theme.text_color);
              root.style.setProperty('--ap-text-main', theme.text_color);
            } else {
              root.style.setProperty('--text-main', '#ffffff');
              root.style.setProperty('--ap-text-main', '#ffffff');
            }
          }

          // Apply assets if they exist via custom CSS properties or store them
          if (theme.favicon_url) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = theme.favicon_url;
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic theme", err);
      }
    };
    applyDynamicTheme();
  }, [organizationId, localTheme]);

  return null; // This is a logic-only component
}
