import React from 'react';
import { SignIn } from '@clerk/clerk-react';

export default function Login() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
      <SignIn path="/login" routing="path" signUpUrl="/register" />
    </div>
  );
}
