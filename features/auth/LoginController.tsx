import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/hooks/useAlert';
import { devLog, devError } from '@/utils/logger';
import { importBackupFromFile } from '@/services/backup';
import { useLoginViewModel } from './loginViewModel';
import { LoginView } from './LoginView';

export function LoginController() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const { showAlert, hideAlert, alertState } = useAlert();
  const [isSyncing, setIsSyncing] = useState(false);

  const viewModel = useLoginViewModel();
  const { 
    email, password, confirmPassword, name,
    isLoading, setIsLoading, mode 
  } = viewModel;

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Erro', 'Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      showAlert('Erro no Login', error);
    } else {
      router.replace('/');
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      showAlert('Erro', 'Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      showAlert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    // Agora passamos o nome também
    try {
      devLog('Iniciando cadastro...');
      const { error } = await signUp(name, email, password);
      devLog('Cadastro finalizado. Erro:', error);
      
      if (error) {
        showAlert('Erro no Cadastro', error);
      } else {
        showAlert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
        viewModel.toggleMode();
      }
    } catch (e) {
      devError('Erro não tratado no Controller:', e);
      showAlert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await importBackupFromFile();
      if (result.success) {
        showAlert(
          'Backup Restaurado!',
          `${result.items_restored} itens foram restaurados com sucesso!`
        );
      } else if (result.error !== 'Seleção cancelada') {
        showAlert('Erro', result.error || 'Falha ao restaurar backup');
      }
    } catch (error: any) {
      showAlert('Erro', error.message || 'Falha ao restaurar backup');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <LoginView
      {...viewModel}
      isSyncing={isSyncing}
      insets={insets}
      alertState={alertState}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onSync={handleSync}
      onToggleMode={viewModel.toggleMode}
      onHideAlert={hideAlert}
    />
  );
}

