
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { FiDroplet } from 'react-icons/fi';

const ThemeToggle = () => {
    const { currentTheme, setCurrentTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Helper to get a nice gradient for the button based on theme
    const getButtonGradient = () => {
        return `linear - gradient(135deg, ${currentTheme.accent} 0 %, ${currentTheme.accent700} 100 %)`;
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', zIndex: 50 }}>
            {/* Main Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    background: 'rgba(20, 20, 20, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${currentTheme.accent} `,
                    borderRadius: '50px',
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    color: '#fff',
                    boxShadow: `0 0 15px ${currentTheme.neon} `,
                    fontSize: '15px',
                    fontWeight: 600,
                    outline: 'none'
                }}
            >
                <FiDroplet style={{ color: currentTheme.accent, fontSize: '18px' }} />
                <span>Theme: {currentTheme.name}</span>
            </motion.button>

            {/* Dropdown / Expansion */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        style={{
                            position: 'absolute',
                            top: '120%',
                            left: 0, // Aligned to left of button
                            background: 'rgba(10, 10, 10, 0.95)',
                            border: `1px solid rgba(255, 255, 255, 0.1)`,
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            width: 'max-content',
                            backdropFilter: 'blur(15px)'
                        }}
                    >
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 700, marginBottom: '4px' }}>
                            Select Mode
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {Object.values(themes).map((t) => (
                                <motion.button
                                    key={t.id}
                                    onClick={() => {
                                        setCurrentTheme(t);
                                        // Optional: close on select or keep open. Keeping open is fun for playing.
                                    }}
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    title={t.name}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: t.accent,
                                        border: currentTheme.id === t.id ? '2px solid white' : 'none',
                                        boxShadow: currentTheme.id === t.id ? `0 0 12px ${t.accent} ` : 'none',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeToggle;
