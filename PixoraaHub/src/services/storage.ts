import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      Logger.error(`Error storing data for key ${key}:`, error);
      throw new Error(`Failed to store data: ${error}`);
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      Logger.error(`Error retrieving data for key ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> { 
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      Logger.error(`Error removing data for key ${key}:`, error);
      throw new Error(`Failed to remove data: ${error}`);
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      Logger.error('Error clearing storage:', error);
      throw new Error('Failed to clear storage');
    }
  }

  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      Logger.error('Error getting all keys:', error);
      return [];
    }
  }
} 