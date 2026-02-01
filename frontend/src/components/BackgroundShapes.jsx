import React from 'react';

const BackgroundShapes = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            {/* Top Left - Yellow Circle */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '5%',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'var(--neo-yellow)',
                border: '3px solid black',
                boxShadow: '4px 4px 0 black'
            }} />

            {/* Center Right - Red Square */}
            <div style={{
                position: 'absolute',
                top: '40%',
                right: '8%',
                width: '60px',
                height: '60px',
                background: 'var(--neo-red)',
                border: '3px solid black',
                transform: 'rotate(15deg)',
                boxShadow: '4px 4px 0 black'
            }} />

            {/* Bottom Left - Green Triangle (using CSS borders) */}
            <div style={{
                position: 'absolute',
                bottom: '15%',
                left: '10%',
                width: 0,
                height: 0,
                borderLeft: '40px solid transparent',
                borderRight: '40px solid transparent',
                borderBottom: '70px solid var(--neo-green)',
                filter: 'drop-shadow(4px 4px 0 black)',
                transform: 'rotate(-10deg)'
            }} />
            {/* Triangle Border Hack */}
            <div style={{
                position: 'absolute',
                bottom: '15%',
                left: '10%',
                width: 0,
                height: 0,
                borderLeft: '40px solid transparent',
                borderRight: '40px solid transparent',
                borderBottom: '70px solid black',
                transform: 'rotate(-10deg) translate(-3px, 3px)', // Offset for border effect
                zIndex: -1
            }} />

            {/* Top Right - Violet Rectangle */}
            <div style={{
                position: 'absolute',
                top: '15%',
                right: '15%',
                width: '100px',
                height: '40px',
                background: 'var(--neo-violet)',
                border: '3px solid black',
                transform: 'rotate(-5deg)',
                boxShadow: '4px 4px 0 black'
            }} />

            {/* Bottom Right - Blue Circle */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                right: '5%',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--neo-white)', // Using white/blue mix or just white
                border: '3px solid black',
                boxShadow: '4px 4px 0 black'
            }} />
        </div>
    );
};

export default BackgroundShapes;
