import AsyncStorage from '@react-native-async-storage/async-storage';
import { PendingAction } from '../context/OfflineContext';
import { User } from '../types';

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";
const PENDING_ACTIONS_KEY = "pending_actions";

export const localStorage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  // Add these new methods for offline queue
  async setPendingActions(actions: PendingAction[]): Promise<void> {
    await AsyncStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  },

  async getPendingActions(): Promise<PendingAction[]> {
    const actions = await AsyncStorage.getItem(PENDING_ACTIONS_KEY);
    return actions ? JSON.parse(actions) : [];
  },

  async clearPendingActions(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_ACTIONS_KEY);
  },
};
