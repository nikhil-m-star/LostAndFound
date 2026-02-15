import React from 'react';
import { SignIn } from '@clerk/clerk-react';


export default function Login() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/register"
        appearance={{
          variables: {
            colorPrimary: '#FF6B6B',
            colorText: '#000000',
            colorBackground: '#FFFDF5',
            colorInputBackground: '#FFFFFF',
            colorInputText: '#000000',
            borderRadius: '0px',
            fontFamily: '"Space Grotesk", sans-serif'
          },
          elements: {
            card: {
              boxShadow: '8px 8px 0px 0px #000000',
              border: '4px solid #000000',
              borderRadius: '0px',
              backgroundColor: '#FFFDF5',
              padding: '2.5rem'
            },
            formButtonPrimary: {
              boxShadow: '4px 4px 0px 0px #000000',
              border: '3px solid #000000',
              borderRadius: '0px',
              textTransform: 'uppercase',
              fontWeight: '900',
              backgroundColor: '#FF6B6B',
              color: '#000000',
              fontSize: '16px'
            },
            formButtonPrimary__hover: {
              backgroundColor: '#FF5252',
              transform: 'translate(-2px, -2px)',
              boxShadow: '6px 6px 0px 0px #000000'
            },
            formFieldInput: {
              border: '3px solid #000000',
              borderRadius: '0px',
              backgroundColor: '#FFFFFF',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
              padding: '12px',
              color: '#000000'
            },
            footerActionLink: {
              color: '#FF6B6B',
              fontWeight: '700',
              textDecoration: 'underline'
            },
            headerTitle: {
              fontFamily: '"Space Grotesk", sans-serif',
              fontWeight: '900',
              textTransform: 'uppercase',
              fontSize: '28px'
            },
            dividerLine: {
              background: '#000000',
              height: '2px'
            },
            socialButtonsBlockButton: {
              border: '3px solid #000000',
              borderRadius: '0px',
              boxShadow: '4px 4px 0px 0px #000000',
              color: '#000000',
              fontWeight: '700'
            }
          }
        }}
      />
    </div>
  );
}
