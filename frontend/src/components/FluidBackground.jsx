import React from 'react';
import { motion } from 'framer-motion';

const FluidBackground = () => {
    // We'll create a symmetrical "water-like" float effect
    // 8 blobs: 4 on left, 4 on right (approx), moving in fluid sine waves

    const blobs = [
        // LEFT SIDE CLUSTER (Cyans & Blues)
        { color: 'var(--neon-cyan)', x: ['-20%', '10%', '-10%'], y: ['-20%', '0%', '-10%'], scale: [1, 1.4, 1], dur: 25, delay: 0 },
        { color: 'var(--neon-blue)', x: ['-10%', '5%', '-15%'], y: ['20%', '40%', '20%'], scale: [1.2, 0.8, 1.2], dur: 28, delay: 2 },
        { color: 'var(--purple)', x: ['-5%', '15%', '-5%'], y: ['50%', '30%', '50%'], scale: [0.9, 1.3, 0.9], dur: 32, delay: 4 },
        { color: 'var(--accent-400)', x: ['-15%', '0%', '-20%'], y: ['80%', '60%', '80%'], scale: [1.1, 0.9, 1.1], dur: 22, delay: 1 },

        // RIGHT SIDE CLUSTER (Pinks & Purples)
        { color: 'var(--neon-pink)', x: ['100%', '80%', '100%'], y: ['-10%', '10%', '-10%'], scale: [1, 1.5, 1], dur: 27, delay: 0 },
        { color: 'var(--neon-purple)', x: ['110%', '90%', '110%'], y: ['30%', '50%', '30%'], scale: [1.3, 0.9, 1.3], dur: 30, delay: 3 },
        { color: 'var(--pink)', x: ['95%', '75%', '95%'], y: ['60%', '80%', '60%'], scale: [0.9, 1.2, 0.9], dur: 24, delay: 1 },
        { color: 'var(--cyan)', x: ['105%', '85%', '105%'], y: ['85%', '65%', '85%'], scale: [1.1, 0.8, 1.1], dur: 29, delay: 5 },
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
                        width: '50vmax',
                        height: '50vmax',
                        borderRadius: '50%',
                        background: `radial-gradient(circle at center, ${blob.color}, transparent 65%)`,
                        filter: 'blur(80px)',
                        opacity: 0.5,
                        mixBlendMode: 'screen',
                    }}
                    animate={{
                        x: blob.x,
                        y: blob.y,
                        scale: blob.scale,
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
