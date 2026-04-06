// Service de stockage universel qui fonctionne sur toutes les plateformes
class UniversalStorage {
  private memoryStorage: { [key: string]: string } = {};
  private isNative: boolean = false;
  private asyncStorage: any = null;

  constructor() {
    this.detectEnvironment();
  }

  private detectEnvironment() {
    // Détecter si on est dans un environnement natif
    this.isNative = typeof window === 'undefined' || !window.localStorage;
    
    if (this.isNative) {
      try {
        // Essayer de charger AsyncStorage natif
        this.asyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (error) {
        console.warn('AsyncStorage non disponible, utilisation du stockage en mémoire');
        this.asyncStorage = null;
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (this.isNative && this.asyncStorage) {
        return await this.asyncStorage.getItem(key);
      } else if (!this.isNative && window.localStorage) {
        return window.localStorage.getItem(key);
      } else {
        // Stockage en mémoire comme fallback
        return this.memoryStorage[key] || null;
      }
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return this.memoryStorage[key] || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isNative && this.asyncStorage) {
        await this.asyncStorage.setItem(key, value);
      } else if (!this.isNative && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        // Stockage en mémoire comme fallback
        this.memoryStorage[key] = value;
      }
    } catch (error) {
      console.warn('Storage setItem error:', error);
      // Toujours sauvegarder en mémoire comme fallback
      this.memoryStorage[key] = value;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (this.isNative && this.asyncStorage) {
        await this.asyncStorage.removeItem(key);
      } else if (!this.isNative && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        // Stockage en mémoire comme fallback
        delete this.memoryStorage[key];
      }
    } catch (error) {
      console.warn('Storage removeItem error:', error);
      // Toujours supprimer de la mémoire comme fallback
      delete this.memoryStorage[key];
    }
  }

  async clear(): Promise<void> {
    try {
      if (this.isNative && this.asyncStorage) {
        await this.asyncStorage.clear();
      } else if (!this.isNative && window.localStorage) {
        window.localStorage.clear();
      } else {
        // Stockage en mémoire comme fallback
        this.memoryStorage = {};
      }
    } catch (error) {
      console.warn('Storage clear error:', error);
      // Toujours vider la mémoire comme fallback
      this.memoryStorage = {};
    }
  }
}

export const storage = new UniversalStorage();
