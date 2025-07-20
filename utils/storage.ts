import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Workout } from "@/types/workout";

const WORKOUTS_KEY = "workouts";
const DATA_VERSION_KEY = "data_version";
const CURRENT_DATA_VERSION = "1.0.0";

export const StorageService = {
  // Initialize storage and handle data migration
  async initialize(): Promise<void> {
    try {
      const currentVersion = await AsyncStorage.getItem(DATA_VERSION_KEY);
      if (!currentVersion) {
        // First time setup
        await AsyncStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      } else if (currentVersion !== CURRENT_DATA_VERSION) {
        // Handle data migration here if needed in future versions
        await this.migrateData(currentVersion, CURRENT_DATA_VERSION);
        await AsyncStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
      }
    } catch (error) {
      console.error("Error initializing storage:", error);
    }
  },

  async migrateData(fromVersion: string, toVersion: string): Promise<void> {
    // Handle data migration between versions
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
    // Future migration logic would go here
  },

  // Export data for backup purposes
  async exportData(): Promise<string | null> {
    try {
      const workouts = await this.getWorkouts();
      return JSON.stringify(
        {
          version: CURRENT_DATA_VERSION,
          exportDate: new Date().toISOString(),
          workouts,
        },
        null,
        2,
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      return null;
    }
  },

  async getWorkouts(): Promise<Workout[]> {
    try {
      const workoutsJson = await AsyncStorage.getItem(WORKOUTS_KEY);
      return workoutsJson ? JSON.parse(workoutsJson) : [];
    } catch (error) {
      console.error("Error loading workouts:", error);
      return [];
    }
  },

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
      // Validate data before saving
      if (!Array.isArray(workouts)) {
        throw new Error("Workouts must be an array");
      }

      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error("Error saving workouts:", error);
      throw error;
    }
  },
};
