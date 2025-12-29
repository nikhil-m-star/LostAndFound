import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

export default function Register() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignUp
        path="/register"
        routing="path"
        signInUrl="/login"
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: '#1DB954',
            colorTextOnPrimaryBackground: '#000000',
            colorBackground: '#141414',
            colorInputBackground: '#1f1f1f',
            colorInputText: '#fff',
            borderRadius: '12px'
          },
          elements: {
            card: {
              boxShadow: '0 0 20px rgba(29, 185, 84, 0.2)',
              border: '1px solid rgba(29, 185, 84, 0.1)'
            }
          }
        }}
      />
    </div>
  );
}
