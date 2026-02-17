import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLog, devWarn, devError } from '@/utils/logger';

// URL base da sua API
// Prioriza a variável de ambiente, fallback para o IP local
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_GATEWAY_URL || 'altere-aqui';

export const AUTH_TOKEN_KEY = '@fittrack_auth_token';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Wrapper da Fetch API com suporte a Interceptors (Token) e tratamento de erro
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  // Remove barra inicial se houver para evitar duplicidade
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Configuração de Timeout (10 segundos)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Interceptor: Injeta o token se existir
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      devWarn(`[API] ⚠️ Token de autenticação NÃO encontrado. Requisição será feita sem autenticação.`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal, // Vincula o sinal de abort
    };

    devLog(`[API] Fetching ${url}...`);
    devLog(`[API] Headers enviados:`, {
      'Content-Type': headers['Content-Type'],
      'Accept': headers['Accept'],
      'Authorization': headers['Authorization'] ? 'Bearer [TOKEN_PRESENTE]' : '[AUSENTE]'
    });
    const response = await fetch(url, config);
    clearTimeout(timeoutId); // Limpa o timeout se responder a tempo
    devLog(`[API] Response status: ${response.status}`);

    // Tenta parsear JSON, mas falha graciosamente se for texto/vazio
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      devError(`[API] Error response:`, data);
      // Padroniza o erro para ser capturado no catch
      throw {
        status: response.status,
        message: data?.message || data?.error || 'Ocorreu um erro na requisição',
        data
      };
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId); // Limpa timeout em caso de erro
    devError(`[API] Catch error:`, error);
    
    if (error.name === 'AbortError') {
      throw { message: 'A requisição demorou muito. Verifique sua conexão ou se o servidor está rodando.' };
    }
    if (error.message === 'Network request failed') {
        throw { message: 'Sem conexão com a internet ou servidor inacessível (Verifique se o backend está rodando na porta 3000).' };
    }
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  patch: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
};

