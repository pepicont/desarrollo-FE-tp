import { apiClient } from './httpClient';

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
    tipoUsuario: string;
    urlFoto: string;
  };
}

export interface VerifyTokenResponse {
  message: string;
  user: {
    id: number;
    mail: string;
    nombre: string;
    tipoUsuario: string;
    urlFoto: string;
  };
}

export interface SignupResponse {
  message?: string;
  user: {
    id: number;
    mail: string;
    nombre: string;
    tipoUsuario: string;
    urlFoto: string;
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

  async signupUser({ email, password, name, username, birthDate }: {
    email: string;
    password: string;
    name: string;
    username: string;
    birthDate: string;
  }) {
    try {
      const response = await apiClient.post<SignupResponse>('/auth/register', {
        mail: email,
        contrasenia: password,
        nombre: name,
        nombreUsuario: username,
        fechaNacimiento: birthDate,
      });
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
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

  // Función para desloguearse
  logout(): void {
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
      this.logout();
      return false;
    }
  },

  // Función para obtener la información del usuario actual
  async getCurrentUser(): Promise<VerifyTokenResponse['user'] | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await this.verifyToken(token);
      return response.user;
    } catch {
      this.logout();
      return null;
    }
  },

  // Función para verificar si el usuario es administrador
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.tipoUsuario === 'admin';
  },
  
};
