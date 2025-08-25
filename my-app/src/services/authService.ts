import axios from 'axios';

// Configuración base de axios
const API_BASE_URL = 'http://localhost:3000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tipos TypeScript (basados en el backend)
export interface LoginRequest {
  mail: string;
  contrasenia: string;
}

export interface LoginResponse {
  token: string; 
  user: {
    id: number;
    mail: string;
    nombre: string;
  };
}

export interface VerifyTokenResponse {
  message: string;
  user: {
    id: number;
    mail: string;
    nombre: string;
  };
}

// Servicio de autenticación
export const authService = {
  // Función para hacer login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Función para verificar token 
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const response = await apiClient.get<VerifyTokenResponse>('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error verificando token:', error);
      throw error;
    }
  },

  // Función para guardar token
  saveToken(token: string, remember: boolean = false): void {
    if (remember) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  },

  // Función para obtener token
  getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },

  // Función para eliminar token
  removeToken(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  },

  // Función para verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      await this.verifyToken(token);
      return true;
    } catch {
      // Si el token no es válido, lo eliminamos
      this.removeToken();
      return false;
    }
  },

  // Función para hacer logout
  logout(): void {
    this.removeToken();
  },
};
