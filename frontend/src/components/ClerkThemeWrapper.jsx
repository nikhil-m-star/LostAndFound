import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { useTheme } from '../context/ThemeContext';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}

const ClerkThemeWrapper = ({ children }) => {
    const { currentTheme } = useTheme();

    return (
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            afterSignOutUrl="/"
            appearance={{
                baseTheme: dark,
                variables: {
                    colorPrimary: currentTheme.accent,
                    colorText: '#e6e6e6',
                    colorBackground: '#0b0b0b',
                    colorInputBackground: '#141414',
                    colorInputText: '#fff',
                    fontFamily: 'Poppins, sans-serif',
                    colorTextSecondary: '#b3b3b3',
                    borderRadius: '12px'
                },
                elements: {
                    card: {
                        // Using CSS variables here where possible or theme values
                        boxShadow: `0 0 30px ${currentTheme.neon}, 0 0 60px ${currentTheme.neon}`, // Using theme neon
                        border: `1px solid ${currentTheme.neon}`,
                        background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(0,0,0,0.98))',
                        backdropFilter: 'blur(10px)',
                        padding: '2rem'
                    },
                    headerTitle: {
                        fontSize: '24px',
                        fontWeight: 800,
                        color: '#fff'
                    },
                    headerSubtitle: {
                        color: '#b3b3b3'
                    },
                    formFieldInput: {
                        border: `1px solid ${currentTheme.neon}`,
                        transition: 'all 0.2s',
                        fontSize: '16px',
                        padding: '12px'
                    },
                    formButtonPrimary: {
                        background: `linear-gradient(90deg, ${currentTheme.accent700}, ${currentTheme.accent})`,
                        fontSize: '16px',
                        fontWeight: 700,
                        textTransform: 'none',
                        border: 'none',
                        boxShadow: `0 5px 15px ${currentTheme.neon}`
                    },
                    socialButtonsBlockButton: {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: '15px'
                    },
                    dividerLine: {
                        background: 'rgba(255,255,255,0.08)'
                    },
                    dividerText: {
                        color: '#666'
                    },
                    footerActionLink: {
                        color: currentTheme.accent,
                        fontWeight: 600
                    }
                }
            }}
        >
            {children}
        </ClerkProvider>
    );
};

export default ClerkThemeWrapper;
