import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const { isLoaded, isSignedIn, user } = useUser();
    const location = useLocation();

    if (!isLoaded) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'var(--text-primary)'
            }}>
                Loading...
            </div>
        );
    }

    if (!isSignedIn) {
        // Redirect to login page and save the current location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check for bmsce.ac.in domain
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email || !email.endsWith('@bmsce.ac.in')) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                textAlign: 'center',
                padding: '20px',
                color: 'var(--text-primary)'
            }}>
                <h2 style={{ color: '#ff4444', marginBottom: '16px' }}>Access Restricted</h2>
                <p>This application is only available for BMSCE students and staff.</p>
                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                    Please sign in with your <strong>@bmsce.ac.in</strong> email address.
                </p>
                <div style={{ marginTop: '24px' }}>
                    {/* You might want a logout button here via clerk, but for now just info is fine */}
                    <p style={{ fontSize: '0.9em', opacity: 0.7 }}>Current email: {email}</p>
                </div>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
