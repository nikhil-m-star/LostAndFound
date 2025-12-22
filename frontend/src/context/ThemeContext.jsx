import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
    green: {
        id: 'green',
        name: 'Neon Green',
        accent: '#1DB954',
        accent900: '#0f6a38',
        accent700: '#179f46',
        accent400: '#3edb6a',
        accent200: '#9ff8c9',
        neon: 'rgba(30, 255, 103, 0.4)',
        neonStrong: 'rgba(30, 255, 103, 0.5)',
        glowcolor: '30, 255, 103'
    },
    cyan: {
        id: 'cyan',
        name: 'Cyber Cyan',
        accent: '#00D4FF',
        accent900: '#004a59',
        accent700: '#008ba8',
        accent400: '#33ddff',
        accent200: '#b3f2ff',
        neon: 'rgba(0, 212, 255, 0.4)',
        neonStrong: 'rgba(0, 212, 255, 0.5)',
        glowcolor: '0, 212, 255'
    },
    purple: {
        id: 'purple',
        name: 'Synthwave',
        accent: '#BD00FF',
        accent900: '#4a0063',
        accent700: '#8a00ba',
        accent400: '#cb4dff',
        accent200: '#eeb3ff',
        neon: 'rgba(189, 0, 255, 0.4)',
        neonStrong: 'rgba(189, 0, 255, 0.5)',
        glowcolor: '189, 0, 255'
    },
    orange: {
        id: 'orange',
        name: 'Solar Flare',
        accent: '#FF5500',
        accent900: '#662200',
        accent700: '#b33c00',
        accent400: '#ff7733',
        accent200: '#ffccb3',
        neon: 'rgba(255, 85, 0, 0.4)',
        neonStrong: 'rgba(255, 85, 0, 0.5)',
        glowcolor: '255, 85, 0'
    },
    crimson: {
        id: 'crimson',
        name: 'Red Alert',
        accent: '#FF0033',
        accent900: '#660014',
        accent700: '#b30024',
        accent400: '#ff335c',
        accent200: '#ffb3c2',
        neon: 'rgba(255, 0, 51, 0.4)',
        neonStrong: 'rgba(255, 0, 51, 0.5)',
        glowcolor: '255, 0, 51'
    }
};

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('app-theme');
            return (saved && themes[saved]) ? themes[saved] : themes.green;
        } catch (e) {
            console.warn("Failed to load theme", e);
            return themes.green;
        }
    });

    // Initial load effect removed as it is now handled in useState initializer

    useEffect(() => {
        // Apply variables
        const root = document.documentElement;
        root.style.setProperty('--accent', currentTheme.accent);
        root.style.setProperty('--accent-900', currentTheme.accent900);
        root.style.setProperty('--accent-700', currentTheme.accent700);
        root.style.setProperty('--accent-400', currentTheme.accent400);
        root.style.setProperty('--accent-200', currentTheme.accent200);
        root.style.setProperty('--neon-green', currentTheme.neon);
        root.style.setProperty('--neon-green-strong', currentTheme.neonStrong);

        // Complex properties
        root.style.setProperty('--accent-muted', `rgba(${currentTheme.glowcolor}, 0.12)`);
        root.style.setProperty('--glass', `rgba(${currentTheme.glowcolor}, 0.04)`);
        root.style.setProperty('--accent-light', currentTheme.accent400); // Map to bright accent

        // Dynamic neon glow string
        const glowRGB = currentTheme.glowcolor;
        root.style.setProperty('--neon-glow',
            `0 0 10px rgba(${glowRGB}, 0.5), 0 0 20px rgba(${glowRGB}, 0.3), 0 0 40px rgba(${glowRGB}, 0.1)`
        );

        // Dynamic Select Arrow SVG
        const arrowColor = encodeURIComponent(currentTheme.accent);
        const arrowSVG = `data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22${arrowColor}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E`;
        root.style.setProperty('--select-arrow', `url("${arrowSVG}")`);

        // Note: Some complex box-shadows/gradients in CSS might need direct updates or rely on these vars
        // We updated App.css to use these variables for mostly everything, but let's double check gradients

        // Save
        localStorage.setItem('app-theme', currentTheme.id);
    }, [currentTheme]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
