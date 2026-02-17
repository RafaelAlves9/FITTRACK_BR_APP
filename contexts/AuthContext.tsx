import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User } from '@/services/auth';
import { AUTH_TOKEN_KEY } from '@/services/api';
import { syncPullData } from '@/services/sync';
import { devError } from '@/utils/logger';

const USER_STORAGE_KEY = '@fittrack_user_data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      // Carrega dados do usuário e token salvos para restaurar sessão
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_STORAGE_KEY)
      ]);

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      devError('Falha ao carregar dados de autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const response = await authService.login({ email, password });
      
      // Salva token para requisições futuras (API interceptor usa isso)
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
      
      // Requisito: PULL de dados inicial. Se falhar, bloqueia o login.
      try {
        await syncPullData();
      } catch (syncError) {
        // Limpa token para impedir estado inconsistente
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        throw new Error('Falha ao sincronizar dados do servidor.');
      }

      // Salva dados do usuário para persistência de sessão na UI
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));

      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Erro ao fazer login' };
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<{ error: string | null }> => {
    try {
      await authService.register({ name, email, password });
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Erro ao criar conta' };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_STORAGE_KEY]);
      setUser(null);
    } catch (error) {
      devError('Erro ao sair:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
