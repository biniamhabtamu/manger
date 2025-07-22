import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export const Login: React.FC = () => {
  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  );
};