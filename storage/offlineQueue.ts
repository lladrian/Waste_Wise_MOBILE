import AsyncStorage from "@react-native-async-storage/async-storage";
import { PendingAction } from "../types";

const PENDING_ACTIONS_KEY = "pending_actions";

export const offlineQueueStorage = {
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
