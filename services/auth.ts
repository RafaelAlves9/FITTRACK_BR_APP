import { api } from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  activePlan: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  profile: Profile;
}

export interface Profile {
  id: string;
  updated_at: Date;
  auth_id: string;
  username: string | null;
  phone: string | null;
  avatar_uri: string | null;
  gender: string | null;
  age: number | null;
  onboarding_completed: boolean;
}

export const authService = {
  /**
   * Realiza o login e retorna o token + usuário
   */
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Registra um novo usuário
   */
  register: async (data: RegisterPayload): Promise<void> => {
    return api.post<void>('/auth/register', data);
  },

  /**
   * Endpoint opcional para validar token ou pegar perfil atual
   * Útil para auto-login se o token persistido ainda for válido
   */
  getProfile: async (): Promise<User> => {
    return api.get<User>('/auth/me'); 
  }
};

