import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const FluidBackground = () => {
    const { currentTheme } = useTheme();

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none',
                background: 'var(--bg-gradient)'
            }}
        >
            {/* Blob 1: Top-Left moving to Center */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-20%',
                    width: '90vmax',
                    height: '90vmax',
                    background: `radial-gradient(circle, ${currentTheme.neon} 0%, rgba(0,0,0,0) 65%)`,
                    filter: 'blur(90px)',
                    borderRadius: '50%',
                }}
                animate={{
                    x: ["0%", "40%", "0%"],
                    y: ["0%", "30%", "0%"],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Blob 2: Bottom-Right moving to Center (Symmetric Mirror) */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    right: '-20%',
                    width: '90vmax',
                    height: '90vmax',
                    background: `radial-gradient(circle, ${currentTheme.neonStrong} 0%, rgba(0,0,0,0) 65%)`,
                    filter: 'blur(90px)',
                    borderRadius: '50%',
                }}
                animate={{
                    x: ["0%", "-40%", "0%"],
                    y: ["0%", "-30%", "0%"],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

export default FluidBackground;
