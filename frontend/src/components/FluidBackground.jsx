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
                background: '#030303'
            }}
        >
            {/* Blob 1: Cyan (Top Leaning) */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '10%',
                    width: '60vmax',
                    height: '60vmax',
                    background: 'radial-gradient(circle, rgba(0, 255, 242, 0.25) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(100px)',
                    mixBlendMode: 'screen',
                    borderRadius: '50%',
                }}
                animate={{
                    x: ["0%", "20%", "0%"],
                    y: ["0%", "15%", "0%"],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Blob 2: Purple (Bottom Right Leaning) */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '0%',
                    right: '5%',
                    width: '70vmax',
                    height: '70vmax',
                    background: 'radial-gradient(circle, rgba(189, 0, 255, 0.22) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(100px)',
                    mixBlendMode: 'screen',
                    borderRadius: '50%',
                }}
                animate={{
                    x: ["0%", "-15%", "0%"],
                    y: ["0%", "-20%", "0%"],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Blob 3: Pink (Center/Left) */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '-10%',
                    width: '60vmax',
                    height: '60vmax',
                    background: 'radial-gradient(circle, rgba(255, 0, 85, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(100px)',
                    mixBlendMode: 'screen',
                    borderRadius: '50%',
                }}
                animate={{
                    x: ["0%", "10%", "0%"],
                    y: ["0%", "-10%", "0%"],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </div>
    );
};

export default FluidBackground;
