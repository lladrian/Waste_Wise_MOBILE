import NetInfo from "@react-native-community/netinfo";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { offlineQueueStorage } from "../storage/offlineQueue";

export interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineContextType {
  isOnline: boolean;
  pendingActions: PendingAction[];
  addPendingAction: (
    action: Omit<PendingAction, "id" | "timestamp" | "retries">
  ) => Promise<void>;
  removePendingAction: (actionId: string) => Promise<void>;
  clearPendingActions: () => Promise<void>;
  syncPendingActions: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  useEffect(() => {
    // Load pending actions from storage on mount
    loadPendingActions();

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);

      // Auto-sync when coming back online
      if (state.isConnected) {
        syncPendingActions();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadPendingActions = async () => {
    try {
      const actions = await offlineQueueStorage.getPendingActions();
      setPendingActions(actions);
    } catch (error) {
      console.error("Error loading pending actions:", error);
    }
  };

  const savePendingActions = async (actions: PendingAction[]) => {
    try {
      await offlineQueueStorage.setPendingActions(actions);
      setPendingActions(actions);
    } catch (error) {
      console.error("Error saving pending actions:", error);
    }
  };

  const addPendingAction = async (
    action: Omit<PendingAction, "id" | "timestamp" | "retries">
  ) => {
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      retries: 0,
    };

    const updatedActions = [...pendingActions, newAction];
    await savePendingActions(updatedActions);
  };

  const removePendingAction = async (actionId: string) => {
    const updatedActions = pendingActions.filter(
      (action) => action.id !== actionId
    );
    await savePendingActions(updatedActions);
  };

  const clearPendingActions = async () => {
    await savePendingActions([]);
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const successfulActions: string[] = [];

    for (const action of pendingActions) {
      try {
        // Simulate API calls for different action types
        switch (action.type) {
          case "SUBMIT_REPORT":
            // await reportService.submitReport(action.data);
            console.log("Syncing report:", action.data);
            break;
          case "SUBMIT_COLLECTOR_REPORT":
            // await collectorService.submitReport(action.data);
            console.log("Syncing collector report:", action.data);
            break;
          default:
            console.log("Syncing unknown action:", action);
        }

        successfulActions.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);

        // Increment retry count
        const updatedActions = pendingActions.map((a) =>
          a.id === action.id ? { ...a, retries: a.retries + 1 } : a
        );
        await savePendingActions(updatedActions);
      }
    }

    // Remove successfully synced actions
    if (successfulActions.length > 0) {
      const remainingActions = pendingActions.filter(
        (action) => !successfulActions.includes(action.id)
      );
      await savePendingActions(remainingActions);
    }
  };

  const value: OfflineContextType = {
    isOnline,
    pendingActions,
    addPendingAction,
    removePendingAction,
    clearPendingActions,
    syncPendingActions,
  };

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error("useOffline must be used within an OfflineProvider");
  }
  return context;
};
