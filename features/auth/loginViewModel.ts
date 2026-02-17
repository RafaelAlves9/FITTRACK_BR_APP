import { useState } from 'react';

export function useLoginViewModel() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  return {
    mode,
    name,
    email,
    password,
    confirmPassword,
    isLoading,
    setMode,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setIsLoading,
    toggleMode,
  };
}

