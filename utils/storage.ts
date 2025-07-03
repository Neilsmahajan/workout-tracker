import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Workout } from "@/types/workout";

const WORKOUTS_KEY = "workouts";

export const StorageService = {
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
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
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
};
