import React from 'react';
import { motion } from 'framer-motion';

const FluidBackground = () => {
    // We'll create a symmetrical "water-like" float effect
    // 8 blobs: 4 on left, 4 on right (approx), moving in fluid sine waves

    const blobs = [
        // SPREAD OUT & NON-SPHERICAL BLOBS
        // Left Cluster
        { color: 'var(--neon-cyan)', x: ['-20%', '20%', '-25%'], y: ['10%', '-10%', '15%'], scale: [1.2, 1.8, 1.2], rotate: [0, 90, 0], borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', dur: 18, delay: 0 },
        { color: 'var(--neon-blue)', x: ['-10%', '15%', '-5%'], y: ['40%', '60%', '35%'], scale: [1, 1.5, 1], rotate: [0, -60, 0], borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', dur: 20, delay: 1 },

        // Center Cluster
        { color: 'var(--purple)', x: ['30%', '50%', '30%'], y: ['-10%', '10%', '-15%'], scale: [1.5, 1.1, 1.5], rotate: [0, 45, 0], borderRadius: '50% 20% 50% 80% / 25% 80% 25% 75%', dur: 22, delay: 2 },
        { color: 'var(--accent-400)', x: ['40%', '60%', '45%'], y: ['80%', '60%', '85%'], scale: [1.2, 1.6, 1.2], rotate: [0, -45, 0], borderRadius: '40% 60% 30% 70% / 50% 30% 60% 40%', dur: 19, delay: 0.5 },

        // Right Cluster
        { color: 'var(--neon-pink)', x: ['80%', '60%', '85%'], y: ['20%', '5%', '25%'], scale: [1.4, 1.1, 1.4], rotate: [0, 120, 0], borderRadius: '70% 30% 50% 50% / 30% 50% 70% 50%', dur: 21, delay: 0 },
        { color: 'var(--neon-purple)', x: ['90%', '70%', '95%'], y: ['60%', '80%', '55%'], scale: [1.3, 1.7, 1.3], rotate: [0, -90, 0], borderRadius: '25% 75% 75% 25% / 75% 25% 25% 75%', dur: 23, delay: 1.5 },

        // Extra Floaters
        { color: 'var(--pink)', x: ['10%', '30%', '5%'], y: ['85%', '65%', '90%'], scale: [1, 1.4, 1], rotate: [0, 180, 0], borderRadius: '60% 40% 40% 60% / 40% 60% 60% 40%', dur: 25, delay: 3 },
        { color: 'var(--cyan)', x: ['85%', '65%', '90%'], y: ['-5%', '15%', '-10%'], scale: [1.4, 1, 1.4], rotate: [0, -120, 0], borderRadius: '40% 60% 70% 30% / 50% 30% 60% 40%', dur: 24, delay: 2.5 },
    ];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            overflow: 'hidden',
            background: 'var(--bg)', // Deep dark base
            pointerEvents: 'none'
        }}>
            {/* Base Gradient Overlay for depth */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, var(--bg) 80%)',
                zIndex: 2
            }} />

            {/* Floating Blobs */}
            {blobs.map((blob, i) => (
                <motion.div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '60vmax',
                        height: '50vmax', // Slightly flattened aspect ratio
                        borderRadius: blob.borderRadius,
                        background: `radial-gradient(circle at center, ${blob.color}, transparent 65%)`,
                        filter: 'blur(80px)',
                        opacity: 0.45,
                        mixBlendMode: 'screen',
                    }}
                    animate={{
                        x: blob.x,
                        y: blob.y,
                        scale: blob.scale,
                        rotate: blob.rotate,
                        borderRadius: blob.borderRadius, // Animate shape slightly if possible, or just keep it static irregular
                    }}
                    transition={{
                        duration: blob.dur,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: blob.delay
                    }}
                />
            ))}

            {/* Mesh Texture Overlay for extra detail */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                zIndex: 3
            }} />
        </div>
    );
};

export default FluidBackground;
