import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

export const Signup: React.FC = () => {
  return (
    <AuthLayout title="Create Account" subtitle="Get started with TaskManager">
      <SignupForm />
    </AuthLayout>
  );
};