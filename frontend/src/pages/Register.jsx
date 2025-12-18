import React from 'react';
import { SignUp } from '@clerk/clerk-react';

export default function Register() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <SignUp path="/register" routing="path" signInUrl="/login" />
    </div>
  );
}
