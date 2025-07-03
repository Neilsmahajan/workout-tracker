import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreVertical,
} from "lucide-react-native";
import { StorageService } from "@/utils/storage";
import { showAlert } from "@/utils/alert";
import type { Workout, Exercise } from "@/types/workout";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [isReorderMode, setIsReorderMode] = useState(false);

  const loadWorkout = useCallback(async () => {
    const workouts = await StorageService.getWorkouts();
    const foundWorkout = workouts.find((w) => w.id === id);
    setWorkout(foundWorkout || null);
  }, [id]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !workout) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName.trim(),
      sets: [],
    };

    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };

    await StorageService.updateWorkout(updatedWorkout);
    setNewExerciseName("");
    setShowAddModal(false);
    loadWorkout();
  };

  const handleDeleteExercise = (exerciseId: string) => {
    showAlert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!workout) return;
            const updatedWorkout = {
              ...workout,
              exercises: workout.exercises.filter((e) => e.id !== exerciseId),
            };
            await StorageService.updateWorkout(updatedWorkout);
            loadWorkout();
          },
        },
      ],
    );
  };

  const moveExerciseUp = async (index: number) => {
    if (
      index > 0 &&
      workout &&
      workout.exercises[index] &&
      workout.exercises[index - 1]
    ) {
      const newExercises = [...workout.exercises];
      const temp = newExercises[index]!;
      newExercises[index] = newExercises[index - 1]!;
      newExercises[index - 1] = temp;

      const updatedWorkout = {
        ...workout,
        exercises: newExercises,
      };

      setWorkout(updatedWorkout);
      await StorageService.reorderExercises(workout.id, newExercises);
    }
  };

  const moveExerciseDown = async (index: number) => {
    if (
      index < workout!.exercises.length - 1 &&
      workout &&
      workout.exercises[index] &&
      workout.exercises[index + 1]
    ) {
      const newExercises = [...workout.exercises];
      const temp = newExercises[index]!;
      newExercises[index] = newExercises[index + 1]!;
      newExercises[index + 1] = temp;

      const updatedWorkout = {
        ...workout,
        exercises: newExercises,
      };

      setWorkout(updatedWorkout);
      await StorageService.reorderExercises(workout.id, newExercises);
    }
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Workout not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#007AFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {workout.name}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => setIsReorderMode(!isReorderMode)}
          >
            <MoreVertical size={20} color="#007AFF" strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workout.exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptySubtitle}>
              Add exercises to start tracking your workout
            </Text>
          </View>
        ) : (
          workout.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseRow}>
                <Link href={`/exercise/${workout.id}/${exercise.id}`} asChild>
                  <TouchableOpacity style={styles.exerciseContent}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.setCount}>
                        {exercise.sets.length} set
                        {exercise.sets.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" strokeWidth={2} />
                  </TouchableOpacity>
                </Link>
                <View style={styles.exerciseActions}>
                  {!isReorderMode ? (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteExercise(exercise.id)}
                    >
                      <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
                    </TouchableOpacity>
                  ) : (
                    <>
                      {index > 0 && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => moveExerciseUp(index)}
                        >
                          <ArrowUp size={16} color="#007AFF" strokeWidth={2} />
                        </TouchableOpacity>
                      )}
                      {index < workout.exercises.length - 1 && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => moveExerciseDown(index)}
                        >
                          <ArrowDown
                            size={16}
                            color="#007AFF"
                            strokeWidth={2}
                          />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Exercise</Text>
            <TouchableOpacity onPress={handleAddExercise}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.textInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="e.g., Seated Barbell Shoulder Press"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddExercise}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginHorizontal: 16,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reorderButton: {
    backgroundColor: "#F2F2F7",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#C7C7CC",
    textAlign: "center",
  },
  exerciseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    flex: 1,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  setCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  deleteButton: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  cancelButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
});
