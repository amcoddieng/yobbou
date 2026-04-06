import { storage } from './storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface LoginCredentials {
  email?: string;
  telephone?: string;
  mot_de_passe: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  role: string;
  photo?: string;
  status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Boutique {
  id: number;
  user_id: number;
  nom_boutique: string;
  adresse: string;
  telephone: string;
  photo?: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  boutique?: Boutique;
  token?: string;
}

export interface ValidateTokenResponse {
  success: boolean;
  message: string;
  user?: User;
  boutique?: Boutique;
}

class AuthService {
  private token: string | null = null;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Essayer l'API réelle en premier
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token) {
        this.token = data.token;
        try {
          await storage.setItem('authToken', data.token);
          if (data.user) {
            await storage.setItem('user', JSON.stringify(data.user));
          }
          if (data.boutique) {
            await storage.setItem('boutique', JSON.stringify(data.boutique));
          }
        } catch (storageError) {
          console.warn('Storage error:', storageError);
        }
      }

      return data;
    } catch (error) {
      console.error('Login API error:', error);
      
      // Si l'API n'est pas accessible, utiliser le mode démo
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.warn('API non accessible, utilisation du mode démo');
        
        // Mode démo avec les credentials officiels
        const isValidEmail = credentials.email === 'marie.bernard@example.com';
        const isValidPhone = credentials.telephone === '0345678901';
        const isValidPassword = credentials.mot_de_passe === 'password789';
        
        if ((isValidEmail || isValidPhone) && isValidPassword) {
          const mockResponse = {
            success: true,
            message: 'Connexion réussie (mode démo)',
            user: {
              id: 4,
              nom: 'Bernard',
              prenom: 'Marie',
              telephone: '0345678901',
              email: 'marie.bernard@example.com',
              role: 'boutiquier',
              photo: 'https://example.com/photos/marie.jpg',
              status: 'active',
              is_verified: false,
              created_at: '2026-04-05T19:10:27.000Z',
              updated_at: '2026-04-05T19:10:27.000Z'
            },
            boutique: {
              id: 1,
              user_id: 4,
              nom_boutique: 'Supermarché Yobbou',
              adresse: '123 Rue du Commerce, Abidjan, Côte d\'Ivoire',
              telephone: '0123456789',
              photo: 'https://example.com/photos/boutique.jpg',
              latitude: 6.5244,
              longitude: -3.3792,
              created_at: '2026-04-05T20:45:00.000Z'
            },
            token: 'demo_token_yobbou_2026'
          };

          this.token = mockResponse.token;
          try {
            await storage.setItem('authToken', mockResponse.token);
            await storage.setItem('user', JSON.stringify(mockResponse.user));
            await storage.setItem('boutique', JSON.stringify(mockResponse.boutique));
          } catch (storageError) {
            console.warn('Storage error in demo mode:', storageError);
          }

          return mockResponse;
        } else {
          return {
            success: false,
            message: 'Email/téléphone ou mot de passe incorrect (mode démo)',
          };
        }
      }

      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      return await response.json();
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        success: false,
        message: 'Erreur de validation du token',
      };
    }
  }

  async getProfile(): Promise<AuthResponse> {
    try {
      const token = await this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'Token manquant',
        };
      }

      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Erreur de récupération du profil',
      };
    }
  }

  async getToken(): Promise<string | null> {
    try {
      if (!this.token) {
        this.token = await storage.getItem('authToken');
      }
      return this.token;
    } catch (error) {
      console.error('GetToken error:', error);
      return null;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userStr = await storage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async getBoutique(): Promise<Boutique | null> {
    try {
      const boutiqueStr = await storage.getItem('boutique');
      return boutiqueStr ? JSON.parse(boutiqueStr) : null;
    } catch (error) {
      console.error('Get boutique error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      this.token = null;
      await storage.removeItem('authToken');
      await storage.removeItem('user');
      await storage.removeItem('boutique');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Valider le token avec l'API réelle
      const validation = await this.validateToken(token);
      if (!validation.success) {
        await this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
