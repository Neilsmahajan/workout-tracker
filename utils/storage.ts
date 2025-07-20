import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Workout, Exercise } from "@/types/workout";

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

  async addWorkout(workout: Workout): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      workouts.push(workout);
      await this.saveWorkouts(workouts);
    } catch (error) {
      console.error("Error adding workout:", error);
    }
  },

  async updateWorkout(updatedWorkout: Workout): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const index = workouts.findIndex((w) => w.id === updatedWorkout.id);
      if (index !== -1) {
        workouts[index] = updatedWorkout;
        await this.saveWorkouts(workouts);
      }
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  },

  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const filteredWorkouts = workouts.filter((w) => w.id !== workoutId);
      await this.saveWorkouts(filteredWorkouts);
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  },

  async reorderWorkouts(reorderedWorkouts: Workout[]): Promise<void> {
    try {
      await this.saveWorkouts(reorderedWorkouts);
    } catch (error) {
      console.error("Error reordering workouts:", error);
    }
  },

  async reorderExercises(
    workoutId: string,
    reorderedExercises: Exercise[],
  ): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const workoutIndex = workouts.findIndex((w) => w.id === workoutId);
      if (workoutIndex !== -1 && workouts[workoutIndex]) {
        workouts[workoutIndex].exercises = reorderedExercises;
        await this.saveWorkouts(workouts);
      }
    } catch (error) {
      console.error("Error reordering exercises:", error);
    }
  },

  async updateExercise(
    workoutId: string,
    updatedExercise: Exercise,
  ): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const workoutIndex = workouts.findIndex((w) => w.id === workoutId);
      if (workoutIndex !== -1 && workouts[workoutIndex]) {
        const exerciseIndex = workouts[workoutIndex].exercises.findIndex(
          (e) => e.id === updatedExercise.id,
        );
        if (exerciseIndex !== -1) {
          workouts[workoutIndex].exercises[exerciseIndex] = updatedExercise;
          await this.saveWorkouts(workouts);
        }
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
    }
  },
};
