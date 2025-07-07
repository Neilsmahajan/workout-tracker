import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Workout, Exercise } from "@/types/workout";

const WORKOUTS_KEY = "workouts";

// Web-compatible storage wrapper
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.error("Error accessing localStorage:", error);
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (error) {
        console.error("Error setting localStorage:", error);
        return;
      }
    }
    return AsyncStorage.setItem(key, value);
  },
};

export const StorageService = {
  async getWorkouts(): Promise<Workout[]> {
    try {
      const workoutsJson = await storage.getItem(WORKOUTS_KEY);
      return workoutsJson ? JSON.parse(workoutsJson) : [];
    } catch (error) {
      console.error("Error loading workouts:", error);
      return [];
    }
  },

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
      await storage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error("Error saving workouts:", error);
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
